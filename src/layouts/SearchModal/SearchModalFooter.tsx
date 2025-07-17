import React from "react";
import type { StyleTheme } from "../../types/entities/StyleTheme";

interface SearchModalFooterProps {
  styles: StyleTheme;
}

const SearchModalFooter: React.FC<SearchModalFooterProps> = ({ styles }) => {
  return (
    <div
      className={`border-t px-4 py-2 flex justify-between items-center ${styles.searchModal.footer} ${styles.searchModal.borders}`}
    >
      {/* Left side - Navigation hints */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <kbd
            className={`px-1.5 py-0.5 pointer-events-none text-xs ${styles.hints.key}`}
          >
            ↑
          </kbd>
          <kbd
            className={`px-1.5 py-0.5 pointer-events-none text-xs ${styles.hints.key}`}
          >
            ↓
          </kbd>
          <span className={`text-xs ${styles.hints.text}`}>to navigate</span>
        </div>
        <div className="flex items-center gap-1">
          <kbd
            className={`px-1.5 py-0.5 pointer-events-none text-xs ${styles.hints.key}`}
          >
            Enter
          </kbd>
          <span className={`text-xs ${styles.hints.text}`}>to select</span>
        </div>
      </div>

      {/* Right side - Close hint */}
      <div className="flex items-center gap-1">
        <kbd
          className={`px-1.5 py-0.5 pointer-events-none text-xs ${styles.hints.key}`}
        >
          Esc
        </kbd>
        <span className={`text-xs ${styles.hints.text}`}>to close</span>
      </div>
    </div>
  );
};

export default SearchModalFooter;
