"use client";

import { useLayoutEffect } from "react";
import { GOOGLE_PREVIEW_FONTS_URL, presetById, VALID_PREVIEW_IDS } from "@/lib/font-presets";

const LINK_ID = "kyoto-font-preview-google-css";

function ensureGooglePreviewFonts() {
  if (document.getElementById(LINK_ID)) return;
  const link = document.createElement("link");
  link.id = LINK_ID;
  link.rel = "stylesheet";
  link.href = GOOGLE_PREVIEW_FONTS_URL;
  document.head.appendChild(link);
}

/** Temporary typography comparison, enabled by ?font=<preset>. */
export function FontPreview() {
  useLayoutEffect(() => {
    const sync = () => {
      const param = new URLSearchParams(window.location.search).get("font");
      if (param && VALID_PREVIEW_IDS.has(param)) {
        document.documentElement.dataset.fontPreview = param;
        if (presetById(param).usesGooglePreview) {
          ensureGooglePreviewFonts();
        }
      } else {
        delete document.documentElement.dataset.fontPreview;
      }
    };
    sync();
    window.addEventListener("popstate", sync);
    return () => {
      window.removeEventListener("popstate", sync);
      delete document.documentElement.dataset.fontPreview;
    };
  }, []);
  return null;
}
