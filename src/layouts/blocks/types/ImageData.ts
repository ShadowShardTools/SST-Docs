import type { BaseImage } from "./BaseImage";
export interface ImageData {
  image?: BaseImage;
  scale?: number;
  alignment?: "left" | "center" | "right";
}
