import type { StyleTheme } from "../../siteConfig";

const SidebarNavigationHints: React.FC<{
  styles: StyleTheme;
  className?: string;
}> = ({ styles, className = "" }) => (
  <div
    className={`text-xs text-gray-500 mt-2 flex flex-wrap gap-3 select-none ${className}`}
  >
    <div className="flex items-center gap-1">
      <kbd
        className={`px-1.5 py-0.5 pointer-events-none ${styles.components.keyHints}`}
      >
        Esc
      </kbd>
      <span className={`${styles.text.hints}`}>Unfocus filter</span>
    </div>
    <div className="flex items-center gap-1">
      <kbd
        className={`px-1.5 py-0.5 pointer-events-none ${styles.components.keyHints}`}
      >
        Ctrl
      </kbd>
      <kbd
        className={`px-1.5 py-0.5 pointer-events-none ${styles.components.keyHints}`}
      >
        ↑ or ↓
      </kbd>
      <span className={`${styles.text.hints}`}>Navigate items</span>
    </div>
    <div className="flex items-center gap-1">
      <kbd
        className={`px-1.5 py-0.5 pointer-events-none ${styles.components.keyHints}`}
      >
        Enter
      </kbd>
      <span className={`${styles.text.hints}`}>Select or toggle</span>
    </div>
  </div>
);

export default SidebarNavigationHints;
