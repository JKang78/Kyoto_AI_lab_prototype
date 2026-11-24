"use client";

import { useEffect } from "react";

/** Temporary comparison of Macadam website typography, enabled by ?font=macadam. */
export function FontPreview() {
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("font") === "macadam") {
      document.documentElement.dataset.fontPreview = "macadam";
    }
    return () => { delete document.documentElement.dataset.fontPreview; };
  }, []);
  return null;
}
