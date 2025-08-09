import type { Content } from "../../layouts/render/types";

export interface IndexJson {
  categories: string[];
  items: string[];
}

export interface RawCategory {
  id: string;
  title: string;
  description?: string;
  content?: Content[];
  docs?: string[];
  children?: string[];
}
