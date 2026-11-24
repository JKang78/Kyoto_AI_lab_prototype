"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
} from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  RotateCcw,
  Send,
  Sparkles,
  WifiOff,
  X,
} from "lucide-react";
import { Button, FoxAvatar, haptic, ICON_STROKE } from "@/components/ui";
import type { FoxContext, FoxRecommendedQuestion } from "@/lib/fox-context";
import { buildOfflineFoxAnswer } from "@/lib/fox-fallback";
import type { FoxAnswer } from "@/lib/fox-grounding";
import { translate, type Locale, type MessageKey } from "@/lib/i18n";

const MAX_QUESTION_CHARS = 160;

export interface FoxGuideDialogProps {
  open: boolean;
  onClose: () => void;
  context: FoxContext;
  locale: Locale;
  foxScreenPoint?: { x: number; y: number } | null;
  containerSize?: { width: number; height: number } | null;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function FoxGuideDialog({
  open,
  onClose,
  context,
  locale,
  foxScreenPoint = null,
  containerSize = null,
}: FoxGuideDialogProps) {
  const [questionInput, setQuestionInput] = useState("");
  const [askedQuestion, setAskedQuestion] = useState<string | null>(null);
  const [answer, setAnswer] = useState<FoxAnswer | null>(null);
  const [loading, setLoading] = useState(false);

  const headingRef = useRef<HTMLHeadingElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const titleId = useId();

  const t = useCallback(
    (key: MessageKey, values?: Record<string, string>) => translate(locale, key, values),
    [locale],
  );

  // Abort any in-flight request when the bubble closes.
  useEffect(() => {
    if (!open) {
      abortRef.current?.abort();
      abortRef.current = null;
    }
  }, [open]);

  // Focus heading and support Escape key dismissal while open.
  useEffect(() => {
    if (!open) return;
    headingRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const askFox = useCallback(
    async (rawQuestion: string, questionId?: string) => {
      const trimmed = rawQuestion.trim().slice(0, MAX_QUESTION_CHARS);
      if (!trimmed || loading) return;

      abortRef.current?.abort();
      haptic();
      setAskedQuestion(trimmed);
      setAnswer(null);
      setLoading(true);
      setQuestionInput("");

      const offlineFallback = () =>
        buildOfflineFoxAnswer({
          question: trimmed,
          questionId,
          locale,
          placeId: context.placeId,
          walkId: context.walkId,
        });

      if (typeof navigator !== "undefined" && navigator.onLine === false) {
        setAnswer(offlineFallback());
        setLoading(false);
        return;
      }

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const response = await fetch("/api/fox-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            question: trimmed,
            questionId,
            locale,
            placeId: context.placeId,
            walkId: context.walkId,
            locationSource: context.locationSource,
          }),
        });

        if (!response.ok) {
          setAnswer(offlineFallback());
        } else {
          const data = (await response.json()) as FoxAnswer;
          if (data && typeof data.answer === "string" && data.answer.trim().length > 0) {
            setAnswer(data);
          } else {
            setAnswer(offlineFallback());
          }
        }
      } catch (error) {
        if ((error as { name?: string })?.name === "AbortError") return;
        setAnswer(offlineFallback());
      } finally {
        if (abortRef.current === controller) abortRef.current = null;
        setLoading(false);
      }
    },
    [context.locationSource, context.placeId, context.walkId, loading, locale],
  );

  const handleChipClick = (chip: FoxRecommendedQuestion) => {
    void askFox(chip[locale], chip.id);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void askFox(questionInput);
  };

  const handleAskAnother = () => {
    setAnswer(null);
    setAskedQuestion(null);
    window.setTimeout(() => inputRef.current?.focus(), 0);
  };

  const renderBadge = (grounding: FoxAnswer["grounding"]) => {
    if (grounding === "verified_fixture") {
      return (
        <span className="fox-guide-badge fox-guide-badge--verified">
          <CheckCircle2 size={14} strokeWidth={ICON_STROKE} aria-hidden="true" />
          <span>{t("foxGuideBadgeVerified")}</span>
        </span>
      );
    }
    if (grounding === "hybrid_general_ai") {
      return (
        <span className="fox-guide-badge fox-guide-badge--general">
          <Sparkles size={14} strokeWidth={ICON_STROKE} aria-hidden="true" />
          <span>{t("foxGuideBadgeGeneralAi")}</span>
        </span>
      );
    }
    return (
      <span className="fox-guide-badge fox-guide-badge--offline">
        <WifiOff size={14} strokeWidth={ICON_STROKE} aria-hidden="true" />
        <span>{t("foxGuideBadgeOffline")}</span>
      </span>
    );
  };

  if (!open) return null;

  const width = containerSize?.width || (typeof window !== "undefined" ? window.innerWidth : 390);
  const height = containerSize?.height || (typeof window !== "undefined" ? window.innerHeight : 800);
  const bubbleWidth = Math.min(Math.max(260, width - 24), 340);
  const anchorX = foxScreenPoint ? foxScreenPoint.x : width / 2;
  const anchorY = foxScreenPoint ? foxScreenPoint.y : height * 0.52;
  const left = clamp(anchorX - bubbleWidth / 2, 12, Math.max(12, width - bubbleWidth - 12));
  const tailX = clamp(anchorX - left, 24, bubbleWidth - 24);
  const placeAbove = anchorY >= 320;
  const bottomOffset = clamp(height - anchorY + 34, 96, Math.max(96, height - 260));
  const topOffset = clamp(anchorY + 34, 68, Math.max(68, height - 280));
  const maxHeight = placeAbove
    ? Math.max(220, Math.min(440, height - bottomOffset - 16))
    : Math.max(220, Math.min(440, height - topOffset - 96));

  const bubbleStyle: CSSProperties & { "--fox-tail-x": string } = placeAbove
    ? {
        left: `${left}px`,
        bottom: `${bottomOffset}px`,
        width: `${bubbleWidth}px`,
        maxHeight: `${maxHeight}px`,
        "--fox-tail-x": `${tailX}px`,
      }
    : {
        left: `${left}px`,
        top: `${topOffset}px`,
        width: `${bubbleWidth}px`,
        maxHeight: `${maxHeight}px`,
        "--fox-tail-x": `${tailX}px`,
      };

  return (
    <div className="fox-guide-bubble-layer">
      <div
        className="fox-guide-bubble-backdrop"
        aria-hidden="true"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="fox-guide-bubble"
        data-placement={placeAbove ? "above" : "below"}
        style={bubbleStyle}
      >
        <div className="fox-guide-header">
          <FoxAvatar state={loading ? "walking" : "idle"} size={40} />
          <div className="fox-guide-header-text">
            <h2 ref={headingRef} tabIndex={-1} id={titleId}>
              {t("foxGuideTitle")}
            </h2>
          </div>
          <button
            type="button"
            className="icon-button"
            aria-label={t("close")}
            onClick={onClose}
          >
            <X size={20} strokeWidth={ICON_STROKE} />
          </button>
        </div>
        <div className="fox-guide-bubble-scroll">
          <div className="fox-guide-body">
            <div className="fox-guide-context-row">
              <span className="fox-guide-context-pill">{context.contextLabel[locale]}</span>
            </div>

            {!answer && !loading && (
              <div className="fox-guide-chips" role="group" aria-label={t("foxGuideSuggestedLabel")}>
                {context.recommendedQuestions.map((chip) => (
                  <button
                    key={chip.id}
                    type="button"
                    className="fox-guide-chip"
                    onClick={() => handleChipClick(chip)}
                  >
                    {chip[locale]}
                  </button>
                ))}
              </div>
            )}

            {(loading || answer) && (
              <div className="fox-guide-answer-card" aria-live="polite">
                {askedQuestion && <p className="fox-guide-asked">{askedQuestion}</p>}
                {loading ? (
                  <p className="fox-guide-thinking" role="status">
                    {t("foxGuideThinking")}
                  </p>
                ) : (
                  answer && (
                    <>
                      {renderBadge(answer.grounding)}
                      <p className="fox-guide-answer-text">{answer.answer}</p>
                      {answer.safetyNote && (
                        <p className="fox-guide-safety-note">
                          <AlertTriangle size={14} strokeWidth={ICON_STROKE} aria-hidden="true" />
                          <span>{answer.safetyNote}</span>
                        </p>
                      )}
                      {answer.citations.length > 0 && (
                        <div className="fox-guide-citations">
                          <span className="fox-guide-citations-label">{t("foxGuideSourcesLabel")}</span>
                          <ul>
                            {answer.citations.map((citation) => (
                              <li key={citation.url}>
                                <a href={citation.url} target="_blank" rel="noreferrer">
                                  <span>{citation.title}</span>
                                  <ExternalLink size={12} strokeWidth={ICON_STROKE} aria-hidden="true" />
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <button
                        type="button"
                        className="fox-guide-another"
                        onClick={handleAskAnother}
                      >
                        <RotateCcw size={14} strokeWidth={ICON_STROKE} aria-hidden="true" />
                        <span>{t("foxGuideAskAnother")}</span>
                      </button>
                    </>
                  )
                )}
              </div>
            )}

            <form className="fox-guide-form" onSubmit={handleSubmit}>
              <input
                ref={inputRef}
                type="text"
                className="fox-guide-input"
                value={questionInput}
                maxLength={MAX_QUESTION_CHARS}
                aria-label={t("foxGuideInputLabel")}
                placeholder={t("foxGuidePlaceholder")}
                onChange={(event) => setQuestionInput(event.target.value)}
                disabled={loading}
              />
              <Button
                type="submit"
                className="fox-guide-submit"
                disabled={loading || questionInput.trim().length === 0}
              >
                <Send size={15} strokeWidth={ICON_STROKE} aria-hidden="true" />
                <span>{t("foxGuideAsk")}</span>
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
