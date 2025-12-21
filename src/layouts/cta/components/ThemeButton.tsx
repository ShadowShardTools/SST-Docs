import React from "react";
import { Moon, Sun } from "lucide-react";
import { useCurrentTheme } from "../../../application/hooks";
import type { StyleTheme } from "@shadow-shard-tools/docs-core";

interface Props {
  styles: StyleTheme;
}

export const ThemeButton: React.FC<Props> = ({ styles }) => {
  const [theme, toggleTheme] = useCurrentTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      title="Toggle light/dark mode"
      className={`flex justify-center w-full items-center gap-2 p-2 cursor-pointer ${styles.buttons.common}`}
    >
      {theme === "dark" ? (
        <Sun className="w-6 h-6" />
      ) : (
        <Moon className="w-6 h-6" />
      )}
    </button>
  );
};

export default ThemeButton;
