import type { BaseImage } from "./BaseImage.js";

export interface ImageCarouselData {
  images?: BaseImage[];
  scale?: number;
  alignment?: "left" | "center" | "right";

  carouselOptions?: {
    loop?: boolean;
    gap?: string;
    arrows?: boolean;
    pagination?: boolean;
    autoplay?: boolean;
    interval?: number;
  };
}
