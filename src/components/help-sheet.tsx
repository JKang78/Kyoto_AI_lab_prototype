"use client";
import { translate, type Locale, type MessageKey } from "@/lib/i18n";
import { Button, ConfirmDialog, FoxAvatar } from "./ui";

const POINTS: { title: MessageKey; body: MessageKey }[] = [
  { title: "helpCheckinsTitle", body: "helpCheckinsBody" },
  { title: "helpScenariosTitle", body: "helpScenariosBody" },
  { title: "helpVouchersTitle", body: "helpVouchersBody" },
  { title: "helpCrowdTitle", body: "helpCrowdBody" },
];

/** "How this demo works" (visuals.md E6): the honesty rules as friendly onboarding rather than fine print. */
export function HelpSheet({ open, locale, onClose }: { open: boolean; locale: Locale; onClose: () => void }) {
  const t = (key: MessageKey) => translate(locale, key);
  return <ConfirmDialog open={open} onClose={onClose} title={t("helpTitle")} closeLabel={t("close")} className="help-sheet">
    <div className="help-intro"><FoxAvatar state="idle" size={56} /><p>{t("helpIntro")}</p></div>
    <dl className="help-points">
      {POINTS.map(point => <div key={point.title}><dt>{t(point.title)}</dt><dd>{t(point.body)}</dd></div>)}
    </dl>
    <Button className="full-width" onClick={onClose}>{t("helpDone")}</Button>
  </ConfirmDialog>;
}
