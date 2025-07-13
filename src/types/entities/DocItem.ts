import type { Content } from "./Content";

export interface DocItem {
  id: string;
  title: string;
  content: Content[];
  tags?: string[];
}
