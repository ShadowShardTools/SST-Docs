import type { DocItem } from "../../types/entities/DocItem";
import type { StyleTheme } from "../../types/entities/StyleTheme";

export interface SearchModalProps {
  styles: StyleTheme;
  isOpen: boolean;
  onClose: () => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  results: DocItem[];
  onSelect: (item: DocItem) => void;
}

export interface SearchMatch {
  item: DocItem;
  snippet: string;
  blockIndex?: number;
}

export interface SearchResultItemProps {
  item: DocItem;
  snippet: string;
  searchTerm: string;
  isSelected: boolean;
  styles: StyleTheme;
  onSelect: (item: DocItem) => void;
  onClose: () => void;
}