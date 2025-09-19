import React from "react";
import { Moon, Sun } from "lucide-react";
import type { StyleTheme } from "../../../application/types/StyleTheme";
import { useThemeToggle } from "../hooks/useThemeToggle";
import { useCurrentTheme } from "../../../application/hooks";

interface Props {
  styles: StyleTheme;
}

export const ThemeButton: React.FC<Props> = ({ styles }) => {
  const theme = useCurrentTheme();
  const toggleTheme = useThemeToggle();

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
