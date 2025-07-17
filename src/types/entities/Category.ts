import type { Content } from "./Content";
import type { DocItem } from "./DocItem";

export interface Category {
  id: string;
  title: string;
  description?: string;
  content?: Content[];
  docs?: DocItem[];
  children?: Category[];
}
