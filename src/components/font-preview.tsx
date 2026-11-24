"use client";

import { useLayoutEffect } from "react";

/** Temporary comparison of Macadam website typography, enabled by ?font=macadam. */
export function FontPreview() {
  useLayoutEffect(() => {
    const sync = () => {
      if (new URLSearchParams(window.location.search).get("font") === "macadam") {
        document.documentElement.dataset.fontPreview = "macadam";
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
