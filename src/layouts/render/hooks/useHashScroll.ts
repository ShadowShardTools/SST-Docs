import { useEffect } from "react";

const scrollToHashTarget = () => {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const hashValue = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash;

  if (!hashValue) return;

  // Support both "#anchor" and "#path#anchor" formats by taking the last segment.
  const rawTarget = hashValue.split("#").pop()?.trim();
  if (!rawTarget) return;

  const targetId = decodeURIComponent(rawTarget);

  const tryScroll = (retries: number) => {
    const el = document.getElementById(targetId);
    if (!el) {
      if (retries > 0) {
        // Content may not be in the DOM yet; retry shortly.
        window.setTimeout(() => tryScroll(retries - 1), 50);
      }
      return;
    }

    window.requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  tryScroll(5);
};

export const useHashScroll = (deps: unknown[]) => {
  useEffect(() => {
    scrollToHashTarget();
    window.addEventListener("hashchange", scrollToHashTarget);
    return () => window.removeEventListener("hashchange", scrollToHashTarget);
  }, [deps]);
};

export default useHashScroll;
