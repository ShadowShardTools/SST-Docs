import { useEffect } from "react";
import type { FlatEntry } from "../types";
import { KEYBOARD_SHORTCUTS } from "../constants";
import { isTypingInElement } from "../utilities";

interface UseKeyboardNavigationProps {
  entries: FlatEntry[];
  cursor: number;
  setCursor: (cursor: number | ((prev: number) => number)) => void;
  open: Record<string, boolean>;
  toggle: (id: string) => void;
  onSelect: (entry: any) => void;
  isSearchOpen?: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

export const useKeyboardNavigation = ({
  entries,
  cursor,
  setCursor,
  open,
  toggle,
  onSelect,
  isSearchOpen,
  inputRef,
}: UseKeyboardNavigationProps) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isSearchOpen) return;

      const activeElement = document.activeElement as HTMLElement | null;
      const isTyping = isTypingInElement(activeElement);

      // ESC unfocuses the filter
      if (
        e.key === KEYBOARD_SHORTCUTS.ESCAPE &&
        activeElement === inputRef.current
      ) {
        e.preventDefault();
        inputRef.current?.blur();
        return;
      }

      if (isTyping && activeElement !== inputRef.current) return;

      switch (e.key) {
        case KEYBOARD_SHORTCUTS.ARROW_DOWN:
          if (e.ctrlKey) {
            e.preventDefault();
            setCursor((i) => Math.min(entries.length - 1, i + 1));
          }
          break;
        case KEYBOARD_SHORTCUTS.ARROW_UP:
          if (e.ctrlKey) {
            e.preventDefault();
            setCursor((i) => Math.max(0, i - 1));
          }
          break;
        case KEYBOARD_SHORTCUTS.ARROW_RIGHT: {
          if (!e.ctrlKey) break;
          const entry = entries[cursor];
          if (entry?.type === "category" && !open[entry.id]) {
            e.preventDefault();
            toggle(entry.id);
          }
          break;
        }
        case KEYBOARD_SHORTCUTS.ARROW_LEFT: {
          if (!e.ctrlKey) break;
          const entry = entries[cursor];
          if (entry?.type === "category" && open[entry.id]) {
            e.preventDefault();
            toggle(entry.id);
          }
          break;
        }
        case KEYBOARD_SHORTCUTS.ENTER: {
          if (!e.ctrlKey) break;
          const entry = entries[cursor];
          if (!entry) return;
          e.preventDefault();

          if (entry.type === "doc") {
            onSelect(entry.item);
          } else if (entry.type === "category") {
            onSelect(entry.node);
            if (!open[entry.id]) toggle(entry.id);
          }
          break;
        }
        case KEYBOARD_SHORTCUTS.FILTER:
        case KEYBOARD_SHORTCUTS.FILTER_UPPER:
          if (!isTyping) {
            e.preventDefault();
            inputRef.current?.focus();
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    entries,
    cursor,
    toggle,
    open,
    onSelect,
    isSearchOpen,
    inputRef,
    setCursor,
  ]);
};
