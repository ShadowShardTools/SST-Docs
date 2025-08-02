import { useCallback } from "react";
import { THEME_KEY } from "../constants";

export function useThemeToggle(): () => void {
  return useCallback(() => {
    const html = document.documentElement;
    const isDark = html.classList.contains("dark");
    const next = isDark ? "light" : "dark";

    html.classList.remove("light", "dark");
    html.classList.add(next);
    localStorage.setItem(THEME_KEY, next);
  }, []);
}
