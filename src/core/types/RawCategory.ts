import type { Content } from "./Content.js";

export interface RawCategory {
  id: string;
  title: string;
  description?: string;
  content?: Content[];
  docs?: string[];
  children?: string[];
}
