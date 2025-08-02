import { useEffect } from "react";

export const useHashScroll = (deps: unknown[]) => {
  useEffect(() => {
    const [, , raw] = location.hash.split("#");
    if (!raw) return;

    const hash = decodeURIComponent(raw);
    const el = document.getElementById(hash);
    if (!el) return;

    requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [deps]);
};

export default useHashScroll;
