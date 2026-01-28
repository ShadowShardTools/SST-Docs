import type { StyleTheme } from "@shadow-shard-tools/docs-core";
import { Search } from "lucide-react";
import { memo } from "react";
import Button from "../../common/components/Button";

interface SearchBarProps {
  styles: StyleTheme;
  onClick: () => void;
}

// Split the definition so we can attach a displayName
export const SearchBarComponent: React.FC<SearchBarProps> = ({
  styles,
  onClick,
}) => (
  <Button
    type="button"
    onClick={onClick}
    aria-label="Open search"
    title="Open search (Ctrl + K)"
    className="group relative flex items-center gap-6 justify-between w-full px-3 py-2"
    styles={styles}
  >
    <div className="flex gap-1 items-center">
      <Search className="w-5 h-5 mr-2" />
      <span>Search</span>
    </div>
    <div className="flex gap-1 items-center">
      <kbd className={`px-1.5 py-0.5 pointer-events-none ${styles.hints.key}`}>
        Ctrl
      </kbd>
      <kbd className={`px-1.5 py-0.5 pointer-events-none ${styles.hints.key}`}>
        K
      </kbd>
    </div>
  </Button>
);

SearchBarComponent.displayName = "SearchBar";

export const SearchBar = memo(SearchBarComponent);
export default SearchBar;
