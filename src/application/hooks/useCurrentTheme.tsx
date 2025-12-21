import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";

export type Theme = "light" | "dark";

const THEME_KEY = "theme";

type ThemeContextValue = {
  theme: Theme;
  toggle: () => void;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function getStoredTheme(): Theme | null {
  if (typeof window === "undefined") return null;
  const stored = window.localStorage.getItem(THEME_KEY);
  return stored === "dark" || stored === "light" ? stored : null;
}

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const stored = getStoredTheme();
  if (stored) return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  const targets = [document.documentElement, document.body].filter(
    Boolean,
  ) as HTMLElement[];

  targets.forEach((el) => {
    el.classList.toggle("dark", theme === "dark");
    el.classList.toggle("light", theme === "light");
    el.dataset.theme = theme;
    el.style.colorScheme = theme;
  });
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  // Apply theme immediately after mount & whenever it changes.
  useLayoutEffect(() => {
    applyTheme(theme);
    window.localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  // Follow system preference only when the user has not explicitly chosen a theme.
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleMedia = (event: MediaQueryListEvent) => {
      if (getStoredTheme()) return;
      setThemeState(event.matches ? "dark" : "light");
    };
    media.addEventListener("change", handleMedia);
    return () => media.removeEventListener("change", handleMedia);
  }, []);

  // Sync across tabs/windows.
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== THEME_KEY || !event.newValue) return;
      const next: Theme = event.newValue === "dark" ? "dark" : "light";
      setThemeState(next);
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
  }, []);

  const toggle = useCallback(() => {
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  const value = useMemo(
    () => ({
      theme,
      toggle,
      setTheme,
    }),
    [theme, toggle, setTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useCurrentTheme(): [Theme, () => void] {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useCurrentTheme must be used inside ThemeProvider");
  }
  return [ctx.theme, ctx.toggle];
}

export default useCurrentTheme;
