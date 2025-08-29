export interface DrawImageOptions {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  fit?: "contain" | "cover" | "scale-down" | "none";
  maxWidth?: number;
  maxHeight?: number;
  align?: "left" | "center" | "right";
}
