import type { BaseImage } from "./BaseImage";

export interface ImageCompareData {
  type?: "individual" | "slider";
  scale?: number;
  alignment?: "left" | "center" | "right";

  // Compare images props
  beforeImage?: BaseImage;
  afterImage?: BaseImage;

  // Slider compare props
  sliderColor?: string;
  showPercentage?: boolean;
}
