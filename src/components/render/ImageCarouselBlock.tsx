import React, { lazy } from "react";
import type { StyleTheme } from "../../siteConfig";

const Splide = lazy(() =>
  import("@splidejs/react-splide").then((m) => ({ default: m.Splide })),
);
const SplideSlide = lazy(() =>
  import("@splidejs/react-splide").then((m) => ({ default: m.SplideSlide })),
);

interface CarouselImage {
  imageSrc: string;
  imageAlt?: string;
}

interface ImageCarouselBlockProps {
  styles: StyleTheme;
  carouselImages: CarouselImage[];
  scale?: number; // NEW
}

const ImageCarouselBlock: React.FC<ImageCarouselBlockProps> = ({
  styles,
  carouselImages,
  scale = 1.0,
}) => {
  const isValidScale = !isNaN(scale) && scale > 0;
  const widthPercent = `${(isValidScale ? scale : 1) * 100}%`;

  return (
    <div className="mb-6 mx-auto" style={{ width: widthPercent }}>
      <Splide
        options={{
          type: "loop",
          gap: "1rem",
          arrows: true,
          pagination: false,
        }}
      >
        {carouselImages.map((img, i) => (
          <SplideSlide key={i}>
            <div className="flex flex-col items-center">
              <img
                src={img.imageSrc}
                alt={img.imageAlt || `Image ${i + 1}`}
                style={{ width: "100%" }}
                className={`h-auto ${styles.components.imageBorder}`}
              />
              {img.imageAlt && (
                <p className={styles.text.alternativeText}>{img.imageAlt}</p>
              )}
            </div>
          </SplideSlide>
        ))}
      </Splide>
    </div>
  );
};

export default ImageCarouselBlock;
