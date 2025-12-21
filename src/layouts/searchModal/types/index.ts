import type { DocItem } from "@shadow-shard-tools/docs-core";

export interface SearchMatch {
  item: DocItem;
  snippet: string;
  blockIndex?: number;
}
