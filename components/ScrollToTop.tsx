"use client";

import { useEffect, useLayoutEffect } from "react";

export default function ScrollToTop() {
  const forceScrollToTop = () => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  useLayoutEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    if (window.location.hash) {
      window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search
      );
    }

    forceScrollToTop();
  }, []);

  useEffect(() => {
    const handlePageShow = () => {
      forceScrollToTop();

      requestAnimationFrame(() => {
        forceScrollToTop();

        requestAnimationFrame(() => {
          forceScrollToTop();
        });
      });

      window.setTimeout(forceScrollToTop, 50);
      window.setTimeout(forceScrollToTop, 200);
    };

    const handleBeforeUnload = () => {
      forceScrollToTop();
    };

    handlePageShow();

    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return null;
}
