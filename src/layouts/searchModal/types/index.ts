import type { DocItem } from "../../render/types";

export interface SearchMatch {
  item: DocItem;
  snippet: string;
  blockIndex?: number;
}
