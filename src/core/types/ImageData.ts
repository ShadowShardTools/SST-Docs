import type { BaseImage } from "./BaseImage.js";
export interface ImageData {
  image?: BaseImage;
  scale?: number;
  alignment?: "left" | "center" | "right";
}
