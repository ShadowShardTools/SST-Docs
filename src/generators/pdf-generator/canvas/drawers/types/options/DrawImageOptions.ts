export interface DrawImageOptions {
  x?: number;
  y?: number;
  scale?: number;
  width?: number;
  height?: number;
  maxWidth?: number;
  maxHeight?: number;
  fit?: "contain" | "cover" | "scale-down" | "none";
  align?: "left" | "center" | "right";
  spacingBefore?: number;
  spacingAfter?: number;
}
