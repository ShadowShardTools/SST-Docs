import type { Category } from "./Category";
import type { DocItem } from "./DocItem";

export interface MainPageState {
  isMobileNavOpen: boolean;
  selectedItem: DocItem | null;
  selectedCategory: Category | null;
  isSearchOpen: boolean;
  searchTerm: string;
  searchResults: DocItem[];
}

export interface NavigationHandlers {
  navigateToEntry: (entry: DocItem | Category) => void;
  handleSearchClose: () => void;
  handleSearchSelect: (item: DocItem) => void;
}

export type EntryType = DocItem | Category;
