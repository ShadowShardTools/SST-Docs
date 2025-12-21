import type { Category, DocItem } from "@shadow-shard-tools/docs-core";

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
