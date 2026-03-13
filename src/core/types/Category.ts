import type { Content } from "./Content.js";
import type { DocItem } from "./DocItem.js";

export interface Category {
  id: string;
  title: string;
  description?: string;
  content?: Content[];
  tags?: string[];
  docs?: DocItem[];
  children?: Category[];
}
