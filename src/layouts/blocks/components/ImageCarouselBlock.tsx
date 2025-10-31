import React, { lazy, Suspense } from "react";
import type { StyleTheme } from "../../../application/types/StyleTheme";
import type { ImageCarouselData } from "../types";
import { validateScale, getResponsiveWidth } from "../utilities";
import { useMobileDevice } from "../hooks";
import {
  ALIGNMENT_CLASSES,
  SPACING_CLASSES,
  DEFAULT_CAROUSEL_OPTIONS,
} from "../constants";
import { withBasePath } from "../utilities";

const Splide = lazy(() =>
  import("@splidejs/react-splide").then((m) => ({ default: m.Splide })),
);
const SplideSlide = lazy(() =>
  import("@splidejs/react-splide").then((m) => ({ default: m.SplideSlide })),
);

interface Props {
  index: number;
  styles: StyleTheme;
  imageCarouselData: ImageCarouselData;
}

export const ImageCarouselBlock: React.FC<Props> = ({
  index,
  styles,
  imageCarouselData,
}) => {
  const isMobile = useMobileDevice();
  const scale = validateScale(imageCarouselData.scale);
  const alignment = imageCarouselData.alignment ?? "center";
  const width = getResponsiveWidth(scale, isMobile);

  const baseClasses = `${SPACING_CLASSES.medium} ${ALIGNMENT_CLASSES[alignment].text}`;
  const containerAlignment = isMobile
    ? "w-full"
    : ALIGNMENT_CLASSES[alignment].container;

  const carouselOptions = {
    ...DEFAULT_CAROUSEL_OPTIONS,
    ...imageCarouselData.carouselOptions,
  };

  if (!imageCarouselData.images?.length) return null;

  return (
    <div key={index} className={baseClasses}>
      <div className={containerAlignment} style={{ width }}>
        <Suspense
          fallback={<div className="h-64 bg-gray-200 animate-pulse rounded" />}
        >
          <Splide options={carouselOptions}>
            {imageCarouselData.images.map((img, i) => {
              const src = img?.src ? withBasePath(img.src) : "";
              return (
                <SplideSlide key={i}>
                  <div className="flex flex-col items-center">
                    <img
                      src={src}
                      alt={img.alt || `Image ${i + 1}`}
                      className="w-full h-auto"
                    />
                    {img.alt && (
                      <p className={`mt-2 ${styles.text.alternative}`}>
                        {img.alt}
                      </p>
                    )}
                  </div>
                </SplideSlide>
              );
            })}
          </Splide>
        </Suspense>
      </div>
    </div>
  );
};

export default ImageCarouselBlock;
