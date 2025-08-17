import type { BaseImage } from "./BaseImage";

export interface ImageGridData {
  images?: BaseImage[];
  scale?: number;
  alignment?: "left" | "center" | "right";
}
