// src/hooks/useTheme.ts
import { useEffect, useState } from "react";

/**
 * React hook that returns "light" or "dark" depending on whether
 * the <html> element has the `dark` class.
 */
export function useTheme(): "light" | "dark" {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    return document.documentElement.classList.contains("dark")
      ? "dark"
      : "light";
  });

  useEffect(() => {
    const target = document.documentElement;

    const updateTheme = () => {
      setTheme(target.classList.contains("dark") ? "dark" : "light");
    };

    const observer = new MutationObserver(updateTheme);

    observer.observe(target, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return theme;
}
