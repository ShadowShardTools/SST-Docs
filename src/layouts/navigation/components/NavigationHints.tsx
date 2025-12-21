import type { StyleTheme } from "@shadow-shard-tools/docs-core";
import React, { useState } from "react";

export interface Props {
  styles: StyleTheme;
}

export const NavigationHints: React.FC<Props> = ({ styles }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="text-xs mt-2 mb-4">
      <button
        onClick={() => setExpanded((prev) => !prev)}
        className={`select-none cursor-pointer mb-1 ${styles.navigation.hideOrShowHintsText}`}
      >
        {expanded ? "Hide keyboard hints" : "Show keyboard hints"}
      </button>

      {expanded && (
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-1">
            <kbd
              className={`px-1.5 py-0.5 pointer-events-none ${styles.hints.key}`}
            >
              Esc
            </kbd>
            <span className={styles.hints.text}>Unfocus filter</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd
              className={`px-1.5 py-0.5 pointer-events-none ${styles.hints.key}`}
            >
              Ctrl
            </kbd>
            <kbd
              className={`px-1.5 py-0.5 pointer-events-none ${styles.hints.key}`}
            >
              ↑/↓
            </kbd>
            <span className={styles.hints.text}>Navigate items</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd
              className={`px-1.5 py-0.5 pointer-events-none ${styles.hints.key}`}
            >
              Ctrl
            </kbd>
            <kbd
              className={`px-1.5 py-0.5 pointer-events-none ${styles.hints.key}`}
            >
              ←/→
            </kbd>
            <span className={styles.hints.text}>Expand/Collapse category</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd
              className={`px-1.5 py-0.5 pointer-events-none ${styles.hints.key}`}
            >
              Ctrl
            </kbd>
            <kbd
              className={`px-1.5 py-0.5 pointer-events-none ${styles.hints.key}`}
            >
              Enter
            </kbd>
            <span className={styles.hints.text}>Select</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default NavigationHints;
