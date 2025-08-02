import { useEffect, useRef } from "react";

export const useInputFocus = (isOpen: boolean) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  return inputRef;
};
