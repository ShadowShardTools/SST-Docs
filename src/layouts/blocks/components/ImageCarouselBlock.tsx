import React, { lazy, Suspense } from "react";
import { getResponsiveWidth } from "@shadow-shard-tools/docs-core/utilities/dom/getResponsiveWidth";
import { validateScale } from "@shadow-shard-tools/docs-core/utilities/validation/validateScale";
import type { ImageCarouselData } from "@shadow-shard-tools/docs-core/types/ImageCarouselData";
import type { StyleTheme } from "@shadow-shard-tools/docs-core/types/StyleTheme";
import { useMobileDevice } from "../hooks";
import { DEFAULT_CAROUSEL_OPTIONS } from "../constants";
import {
  ALIGNMENT_CLASSES,
  SPACING_CLASSES,
} from "@shadow-shard-tools/docs-core";
import { withBasePath } from "@shadow-shard-tools/docs-core";

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
  const hasPagination = !!carouselOptions.pagination;

  if (!imageCarouselData.images?.length) return null;

  return (
    <div key={index} className={baseClasses}>
      <div className={containerAlignment} style={{ width }}>
        <Suspense
          fallback={
            <div
              className={`h-64 animate-pulse rounded ${styles.sections.contentBackground || "sst-content-bg"}`}
            />
          }
        >
          <Splide options={carouselOptions}>
            {imageCarouselData.images.map((img, i) => {
              const src = img?.src
                ? withBasePath(img.src, import.meta.env.BASE_URL)
                : "";
              return (
                <SplideSlide key={i}>
                  <div
                    className={`flex flex-col items-center ${hasPagination ? "pb-8" : ""}`}
                  >
                    <img
                      src={src}
                      alt={img.alt || `Image ${i + 1}`}
                      className="w-full h-auto"
                    />
                    {img.alt && (
                      <p className={`${styles.text.caption} text-center`}>
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
