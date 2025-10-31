export interface TitleData {
  text?: string;
  level?: 1 | 2 | 3;
  alignment?: "left" | "center" | "right";
  spacing?: "none" | "small" | "medium" | "large";
  underline?: boolean;
  enableAnchorLink?: boolean;
}
