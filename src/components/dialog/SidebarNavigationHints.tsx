import type { StyleTheme } from "../../types/entities/StyleTheme";

const SidebarNavigationHints: React.FC<{
  styles: StyleTheme;
  className?: string;
}> = ({ styles, className = "" }) => (
  <div
    className={`text-xs text-gray-500 mt-2 flex flex-wrap gap-3 select-none ${className}`}
  >
    <div className="flex items-center gap-1">
      <kbd className={`px-1.5 py-0.5 pointer-events-none ${styles.hints.key}`}>
        Esc
      </kbd>
      <span className={`${styles.hints.text}`}>Unfocus filter</span>
    </div>
    <div className="flex items-center gap-1">
      <kbd className={`px-1.5 py-0.5 pointer-events-none ${styles.hints.key}`}>
        Ctrl
      </kbd>
      <kbd className={`px-1.5 py-0.5 pointer-events-none ${styles.hints.key}`}>
        ↑ or ↓
      </kbd>
      <span className={`${styles.hints.text}`}>Navigate items</span>
    </div>
    <div className="flex items-center gap-1">
      <kbd className={`px-1.5 py-0.5 pointer-events-none ${styles.hints.key}`}>
        Enter
      </kbd>
      <span className={`${styles.hints.text}`}>Select or toggle</span>
    </div>
  </div>
);

export default SidebarNavigationHints;
