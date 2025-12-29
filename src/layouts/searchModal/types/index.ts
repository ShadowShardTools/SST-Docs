import type { Category, DocItem } from "@shadow-shard-tools/docs-core";

export interface SearchMatch {
  item: DocItem | Category;
  snippet: string;
  blockIndex?: number;
  score: number;
}
