import { useEffect, useRef, useState } from "react";
import { FixedSizeList as List } from "react-window";
import type { SearchMatch } from "../types";
import { KEYBOARD_SHORTCUTS } from "../constants";
import type { Category, DocItem } from "@shadow-shard-tools/docs-core";

export const useKeyboardNavigation = (
  isOpen: boolean,
  processedResults: SearchMatch[],
  onSelect: (item: DocItem | Category) => void,
  onClose: () => void,
) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const listRef = useRef<List>(null);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [processedResults]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case KEYBOARD_SHORTCUTS.ARROW_DOWN:
          event.preventDefault();
          setSelectedIndex((prev) =>
            prev < processedResults.length - 1 ? prev + 1 : prev,
          );
          break;
        case KEYBOARD_SHORTCUTS.ARROW_UP:
          event.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
          break;
        case KEYBOARD_SHORTCUTS.ENTER:
          event.preventDefault();
          if (processedResults[selectedIndex]) {
            onSelect(processedResults[selectedIndex].item);
            onClose();
          }
          break;
        case KEYBOARD_SHORTCUTS.ESCAPE:
          event.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, processedResults, selectedIndex, onSelect, onClose]);

  // Scroll to selected item
  useEffect(() => {
    if (listRef.current && selectedIndex >= 0) {
      listRef.current.scrollToItem(selectedIndex, "smart");
    }
  }, [selectedIndex]);

  return { selectedIndex, listRef };
};
