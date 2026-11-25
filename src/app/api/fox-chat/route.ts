import { NextResponse } from "next/server";
import { CURATED_PLACES, CURATED_WALKS } from "@/data/kyoto-walks";
import { buildOfflineFoxAnswer } from "@/lib/fox-fallback";
import {
  buildFoxGroundingPacket,
  buildFoxSystemPrompt,
  checkFoxAnswer,
} from "@/lib/fox-grounding";
import { clientKey, createRateLimiter } from "@/lib/rate-limit";
import type { FoxLocationSource } from "@/lib/fox-context";

const MAX_QUESTION_LENGTH = 160;
const GEMINI_TIMEOUT_MS = 10000;
const DEFAULT_GEMINI_MODELS = ["gemini-3.1-flash-lite", "gemini-3.8-flash"] as const;
// Ten questions a minute per client is ample for the Q&A card and stops a loop from running up model costs.
const limiter = createRateLimiter({ limit: 10, windowMs: 60_000 });
// Block harmful content in both directions on top of the prompt's own refusals.
const SAFETY_SETTINGS = ["HARASSMENT", "HATE_SPEECH", "SEXUALLY_EXPLICIT", "DANGEROUS_CONTENT"].map((category) => ({
  category: `HARM_CATEGORY_${category}`,
  threshold: "BLOCK_MEDIUM_AND_ABOVE",
}));

/** Server log for a skipped model answer. Never includes the question, answer text, location, or client address. */
function logRejected(model: string, reason: string) {
  console.warn(JSON.stringify({ event: "fox_chat_model_rejected", model, reason }));
}

const FORBIDDEN_COORDINATE_KEYS = [
  "lat",
  "lng",
  "latitude",
  "longitude",
  "coordinates",
  "position",
  "coords",
] as const;

const LOCATION_SOURCES = new Set<FoxLocationSource>(["live", "demo", "sample"]);

const RESPONSE_SCHEMA = {
  type: "OBJECT",
  required: ["answer", "grounding", "citations"],
  properties: {
    answer: { type: "STRING" },
    grounding: {
      type: "STRING",
      enum: ["verified_fixture", "hybrid_general_ai"],
    },
    citations: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        required: ["title", "url"],
        properties: {
          title: { type: "STRING" },
          url: { type: "STRING" },
        },
      },
    },
    safetyNote: { type: "STRING" },
  },
} as const;

interface ValidatedRequest {
  question: string;
  questionId?: string;
  locale: "en" | "ja";
  placeId: string | null;
  walkId: string | null;
  locationSource: FoxLocationSource;
}

function parseRequestBody(raw: unknown): ValidatedRequest | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const record = raw as Record<string, unknown>;

  // Privacy invariant: never accept raw GPS coordinates.
  for (const forbiddenKey of FORBIDDEN_COORDINATE_KEYS) {
    if (forbiddenKey in record && record[forbiddenKey] !== undefined) {
      return null;
    }
  }

  if (typeof record.question !== "string") return null;
  const question = record.question.trim();
  if (question.length === 0 || question.length > MAX_QUESTION_LENGTH) return null;

  if (record.locale !== "en" && record.locale !== "ja") return null;

  if (
    typeof record.locationSource !== "string" ||
    !LOCATION_SOURCES.has(record.locationSource as FoxLocationSource)
  ) {
    return null;
  }

  let placeId: string | null = null;
  if (record.placeId !== null && record.placeId !== undefined) {
    if (
      typeof record.placeId !== "string" ||
      !CURATED_PLACES.some((place) => place.id === record.placeId)
    ) {
      return null;
    }
    placeId = record.placeId;
  }

  let walkId: string | null = null;
  if (record.walkId !== null && record.walkId !== undefined) {
    if (
      typeof record.walkId !== "string" ||
      !CURATED_WALKS.some((walk) => walk.id === record.walkId)
    ) {
      return null;
    }
    walkId = record.walkId;
  }

  const questionId =
    typeof record.questionId === "string" && record.questionId.trim().length > 0
      ? record.questionId.trim().slice(0, 64)
      : undefined;

  return {
    question,
    questionId,
    locale: record.locale,
    placeId,
    walkId,
    locationSource: record.locationSource as FoxLocationSource,
  };
}

export async function POST(request: Request) {
  const rate = limiter.take(clientKey(request.headers));
  if (!rate.allowed) {
    // The client shows its offline answer for any non-OK response.
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } });
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = parseRequestBody(rawBody);
  if (!parsed) {
    return NextResponse.json({ error: "Invalid request parameters" }, { status: 400 });
  }

  const { question, questionId, locale, placeId, walkId } = parsed;
  const fallback = () =>
    buildOfflineFoxAnswer({ question, questionId, locale, placeId, walkId });

  // X-Fox-Source names the model that answered, or "offline", for debugging without logging content.
  const offline = () => NextResponse.json(fallback(), { headers: { "X-Fox-Source": "offline" } });
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return offline();

  const packet = buildFoxGroundingPacket({ placeId, walkId, locale });
  const systemPrompt = buildFoxSystemPrompt(packet, locale);
  const envModel = process.env.GEMINI_MODEL?.trim();
  const models = envModel ? [envModel] : [...DEFAULT_GEMINI_MODELS];

  const payload = JSON.stringify({
    systemInstruction: {
      parts: [{ text: systemPrompt }],
    },
    contents: [
      {
        role: "user",
        parts: [
          {
            text: JSON.stringify({
              locale,
              questionId: questionId ?? null,
              question,
            }),
          },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
    },
    safetySettings: SAFETY_SETTINGS,
  });

  for (const model of models) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          signal: AbortSignal.timeout(GEMINI_TIMEOUT_MS),
          body: payload,
        },
      );

      if (!response.ok) {
        logRejected(model, `http_${response.status}`);
        continue;
      }

      const data = (await response.json()) as {
        promptFeedback?: { blockReason?: string };
        candidates?: Array<{
          finishReason?: string;
          content?: {
            parts?: Array<{ text?: string }>;
          };
        }>;
      };

      const candidate = data.candidates?.[0];
      const text = candidate?.content?.parts?.[0]?.text;
      if (!text) {
        logRejected(model, data.promptFeedback?.blockReason ? `blocked_${data.promptFeedback.blockReason}` : `empty_${candidate?.finishReason ?? "none"}`);
        continue;
      }

      const checked = checkFoxAnswer(JSON.parse(text) as unknown, packet);
      if (checked.ok) {
        return NextResponse.json(checked.answer, { headers: { "X-Fox-Source": model } });
      }
      logRejected(model, checked.reason);
    } catch (error) {
      logRejected(model, (error as { name?: string })?.name === "TimeoutError" ? "timeout" : "error");
      continue;
    }
  }

  return offline();
}
