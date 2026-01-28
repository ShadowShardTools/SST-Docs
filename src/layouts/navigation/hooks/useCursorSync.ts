import { useEffect } from "react";
import { scrollElementIntoView } from "../utilities";

export const useCursorSync = (
  cursor: number,
  entries: any[],
  setCursor: (cursor: number) => void,
  currentKey: string | null,
) => {
  // Keep cursor in range when list shrinks
  useEffect(() => {
    if (cursor >= entries.length) {
      setCursor(entries.length ? 0 : 0);
    }
  }, [entries.length, cursor, setCursor]);

  // Scroll focused row into view
  useEffect(() => {
    if (!currentKey) return;
    scrollElementIntoView(currentKey);
  }, [currentKey]);
};
