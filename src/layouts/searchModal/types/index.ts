import type { Category, DocItem } from "#core";

export interface SearchMatch {
  item: DocItem | Category;
  snippet: string;
  blockIndex?: number;
  score: number;
}
