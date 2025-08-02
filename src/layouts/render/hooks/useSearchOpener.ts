import { useEffect } from "react";

export const useSearchOpener = (onSearchOpen: () => void) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isTyping =
        ["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName || "") ||
        (document.activeElement as HTMLElement)?.isContentEditable;
      if (
        !isTyping &&
        (e.code === "Slash" || (e.ctrlKey && e.code === "KeyK"))
      ) {
        e.preventDefault();
        onSearchOpen();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onSearchOpen]);
};

export default useSearchOpener;
