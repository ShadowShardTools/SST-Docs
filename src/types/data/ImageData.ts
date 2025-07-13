interface BaseImage {
  src: string;
  alt?: string;
}

interface CarouselImage extends BaseImage {
  caption?: string;
}

export interface ImageData {
  type: "single" | "compare" | "carousel" | "slider";
  scale?: number;
  alignment?: "left" | "center" | "right";

  // Single image props
  image?: BaseImage;

  // Compare images props
  beforeImage?: BaseImage;
  afterImage?: BaseImage;

  // Carousel props
  images?: CarouselImage[];
  carouselOptions?: {
    loop?: boolean;
    gap?: string;
    arrows?: boolean;
    pagination?: boolean;
    autoplay?: boolean;
    interval?: number;
  };

  // Slider compare props
  sliderColor?: string;
  showPercentage?: boolean;
}
