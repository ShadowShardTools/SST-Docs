import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import type { StyleTheme } from "../../types/StyleTheme";

const THEME_KEY = "theme";

interface Props {
  styles: StyleTheme;
}

const ThemeButton: React.FC<Props> = ({ styles }) => {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const applyTheme = (newTheme: "light" | "dark") => {
    const html = document.documentElement;
    html.classList.remove("light", "dark");
    html.classList.add(newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
    setTheme(newTheme);
  };

  useEffect(() => {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark") {
      applyTheme(saved);
    } else {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      applyTheme(prefersDark ? "dark" : "light");
    }
  }, []);

  const toggleTheme = () => {
    applyTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      title="Toggle light/dark mode"
      className={`flex justify-center w-full items-center gap-2 p-2 cursor-pointer ${styles.buttons.common}`}
    >
      {theme === "dark" ? (
        <Sun className="w-6 h-6 text-yellow-400" />
      ) : (
        <Moon className="w-6 h-6 text-gray-700" />
      )}
    </button>
  );
};

export default ThemeButton;
