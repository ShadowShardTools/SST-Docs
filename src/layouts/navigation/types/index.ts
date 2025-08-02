import type { Category } from "../../render/types/Category";
import type { StyleTheme } from "../../../types/StyleTheme";
import type { DocItem } from "../../render/types/DocItem";

export interface BranchProps {
  node: Category;
  depth: number;
  open: Record<string, boolean>;
  toggle: (id: string) => void;
  filter: string;
  current: DocItem | Category | null | undefined;
  focusedKey: string | null;
  select: (d: DocItem | Category) => void;
  styles: StyleTheme;
}

export interface CategoryRowProps {
  styles: StyleTheme;
  node: Category;
  depth: number;
  active: boolean;
  expanded: boolean;
  focused: boolean;
  toggle: (id: string) => void;
  select: (c: Category) => void;
}

export interface DocRowProps {
  styles: StyleTheme;
  doc: DocItem;
  depth: number;
  active: boolean;
  focused: boolean;
  select: (d: DocItem) => void;
}

export interface NavigationProps {
  styles: StyleTheme;
  tree: Category[];
  standaloneDocs?: DocItem[];
  onSelect: (entry: DocItem | Category) => void;
  selectedItem?: DocItem | Category | null;
  isSearchOpen?: boolean;
}

export interface NavigationHintsProps {
  styles: StyleTheme;
}

export interface FlatEntryDoc {
  type: "doc";
  id: string;
  item: DocItem;
  depth: number;
  key: string; // doc-${id}
}

export interface FlatEntryCat {
  type: "category";
  id: string;
  node: Category;
  depth: number;
  key: string; // cat-${id}
}

export type FlatEntry = FlatEntryDoc | FlatEntryCat;
