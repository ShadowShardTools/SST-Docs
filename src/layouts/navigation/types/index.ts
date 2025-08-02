import type { Category } from "../../render/types/Category";
import type { DocItem } from "../../render/types/DocItem";
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
