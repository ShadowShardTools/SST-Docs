import type { BaseImage } from "./BaseImage.js";

export interface ImageGridData {
  images?: BaseImage[];
  scale?: number;
  alignment?: "left" | "center" | "right";
}
