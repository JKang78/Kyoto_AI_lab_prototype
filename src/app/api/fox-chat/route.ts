import { NextResponse } from "next/server";
import { CURATED_PLACES, CURATED_WALKS } from "@/data/kyoto-walks";
import { buildOfflineFoxAnswer } from "@/lib/fox-fallback";
import {
  buildFoxGroundingPacket,
  buildFoxSystemPrompt,
  validateFoxAnswer,
} from "@/lib/fox-grounding";
import type { FoxLocationSource } from "@/lib/fox-context";

const MAX_QUESTION_LENGTH = 160;
const GEMINI_TIMEOUT_MS = 8000;
const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";

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

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(fallback());
  }

  const packet = buildFoxGroundingPacket({ placeId, walkId, locale });
  const systemPrompt = buildFoxSystemPrompt(packet, locale);
  const model = process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;

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
        body: JSON.stringify({
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
        }),
      },
    );

    if (!response.ok) {
      return NextResponse.json(fallback());
    }

    const data = (await response.json()) as {
      candidates?: Array<{
        content?: {
          parts?: Array<{ text?: string }>;
        };
      }>;
    };

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return NextResponse.json(fallback());
    }

    const modelJson: unknown = JSON.parse(text);
    const validated = validateFoxAnswer(modelJson, packet);
    if (!validated) {
      return NextResponse.json(fallback());
    }

    return NextResponse.json(validated);
  } catch {
    return NextResponse.json(fallback());
  }
}
