import type { Content } from "./Content.js";

export interface DocItem {
  id: string;
  title: string;
  description: string;
  content: Content[];
  tags?: string[];
}
