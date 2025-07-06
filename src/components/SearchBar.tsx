import { Search } from "lucide-react";
import { memo } from "react";
import type { StyleTheme } from "../config/siteConfig";

interface SearchBarProps {
  styles: StyleTheme;
  onClick: () => void;
}

// Split the definition so we can attach a displayName
const SearchBarComponent: React.FC<SearchBarProps> = ({ styles, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label="Open search"
    title="Open search (Ctrl + K)"
    className="
      group relative flex items-center gap-2
      w-full px-3 py-2
      border border-gray-300 rounded-md
      text-left text-sm text-gray-500
      hover:border-gray-400
      focus:outline-none focus:ring-2 focus:ring-blue-500
      transition-all duration-200 
    "
  >
    <Search className="w-4 h-4 mr-2 text-gray-400 group-hover:text-gray-600" />
    <span className="flex-1 text-gray-500">Search…</span>
    <div className="flex justify-between gap-4">
      <div className="flex gap-1">
        <kbd className={`${styles.componentsStyles.keyHints}`}>Ctrl</kbd>
        <kbd className={`${styles.componentsStyles.keyHints}`}>K</kbd>
      </div>
    </div>
  </button>
);

SearchBarComponent.displayName = "SearchBar";

export const SearchBar = memo(SearchBarComponent);
export default SearchBar;
