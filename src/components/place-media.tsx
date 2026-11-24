"use client";
import Image from "next/image";
import { Lock } from "lucide-react";
import photos from "@/data/place-photos.json";
import { PLACE_STORIES } from "@/data/place-stories";
import { placeById } from "@/lib/game";
import { translate, type Locale, type MessageKey } from "@/lib/i18n";
import { ConfirmDialog, FoxAvatar, ICON_STROKE } from "./ui";
import { PlaceSeal, placeTheme } from "./glyphs";

type PhotoCredit = { src: string; width: number; height: number; title: string; author: string; license: string; licenseUrl: string | null; sourceUrl: string };
const PHOTOS = photos as Record<string, PhotoCredit>;

/** Licensed Commons photo with visible credit (visuals.md E9), or an illustrated placeholder when none fits. */
export function PlacePhoto({ placeId, locale }: { placeId: string; locale: Locale }) {
  const t = (key: MessageKey, values?: Record<string, string>) => translate(locale, key, values);
  const photo = PHOTOS[placeId];
  const name = placeById(placeId)?.name[locale] ?? "";
  if (!photo) {
    return <figure className="place-photo place-photo--placeholder" data-theme={placeTheme(placeId)}>
      <span className="place-photo-art"><PlaceSeal placeId={placeId} size={56} strokeWidth={1.25} /></span>
      <figcaption>{t("photoPlaceholder")}</figcaption>
    </figure>;
  }
  return <figure className="place-photo">
    <Image src={photo.src} width={photo.width} height={photo.height} alt={t("photoAlt", { place: name })} sizes="(max-width: 520px) 100vw, 520px" />
    <figcaption>
      {t("photoCredit", { author: photo.author })} · {photo.licenseUrl
        ? <a href={photo.licenseUrl} target="_blank" rel="noreferrer">{photo.license}</a> : photo.license} · <a href={photo.sourceUrl} target="_blank" rel="noreferrer">{t("photoSource")}</a>
    </figcaption>
  </figure>;
}

/** Sourced draft story, locked until the stop is checked in (visuals.md M3). */
export function PlaceStory({ placeId, locale, unlocked }: { placeId: string; locale: Locale; unlocked: boolean }) {
  const t = (key: MessageKey) => translate(locale, key);
  const story = PLACE_STORIES[placeId];
  if (!story) return null;
  if (!unlocked) {
    return <p className="place-story place-story--locked"><Lock size={16} strokeWidth={ICON_STROKE} aria-hidden="true" />{t("storyLocked")}</p>;
  }
  return <section className="place-story" aria-label={t("storyTitle")}>
    <div className="place-story-head"><FoxAvatar state="arrived" size={40} /></div>
    <p className="place-story-text">{story.text[locale]}</p>
    <p className="place-story-sources">{t("storySources")}: {story.sources.map((source, index) => <span key={source.url}>
      {index > 0 && " · "}<a href={source.url} target="_blank" rel="noreferrer">{source.title}</a></span>)}</p>
  </section>;
}

/** Story with its photo, opened from a stamp receipt or the stamp book. */
export function StoryDialog({ placeId, locale, onClose }: { placeId: string | null; locale: Locale; onClose: () => void }) {
  const place = placeId ? placeById(placeId) : undefined;
  return <ConfirmDialog open={Boolean(place)} onClose={onClose} title={place?.name[locale] ?? ""} closeLabel={translate(locale, "close")} className="story-dialog">
    {place && <>
      <PlacePhoto placeId={place.id} locale={locale} />
      <PlaceStory placeId={place.id} locale={locale} unlocked />
    </>}
  </ConfirmDialog>;
}
