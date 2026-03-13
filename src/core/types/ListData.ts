export interface ListData {
  items?: string[];
  type?: "ul" | "ol";
  startNumber?: number;
  ariaLabel?: string;
  inside?: boolean;
  alignment?: "left" | "center" | "right";
}
