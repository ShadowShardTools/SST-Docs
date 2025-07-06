import type { StyleTheme } from "../../config/siteConfig";

const SidebarNavigationHints: React.FC<{
  styles: StyleTheme;
  className?: string;
}> = ({ styles, className = "" }) => (
  <div
    className={`text-xs text-gray-500 mt-2 flex flex-wrap gap-3 select-none ${className}`}
  >
    <div className="flex items-center gap-1">
      <kbd className={`${styles.componentsStyles.keyHints}`}>Esc</kbd>
      <span className={`${styles.textStyles.hints}`}>Unfocus filter</span>
    </div>
    <div className="flex items-center gap-1">
      <kbd className={`${styles.componentsStyles.keyHints}`}>Ctrl</kbd>
      <kbd className={`${styles.componentsStyles.keyHints}`}>↑ or ↓</kbd>
      <span className={`${styles.textStyles.hints}`}>Navigate items</span>
    </div>
    <div className="flex items-center gap-1">
      <kbd className={`${styles.componentsStyles.keyHints}`}>Enter</kbd>
      <span className={`${styles.textStyles.hints}`}>Select or toggle</span>
    </div>
  </div>
);

export default SidebarNavigationHints;
