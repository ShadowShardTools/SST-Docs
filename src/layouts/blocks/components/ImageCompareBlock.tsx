import React, { useState, lazy, Suspense } from "react";
import { useMobileDevice } from "../hooks";
import {
  ALIGNMENT_CLASSES,
  SPACING_CLASSES,
} from "@shadow-shard-tools/docs-core";
import { getResponsiveWidth } from "@shadow-shard-tools/docs-core/utilities/dom/getResponsiveWidth";
import { validateScale } from "@shadow-shard-tools/docs-core/utilities/validation/validateScale";
import type { ImageCompareData } from "@shadow-shard-tools/docs-core/types/ImageCompareData";
import type { StyleTheme } from "@shadow-shard-tools/docs-core/types/StyleTheme";
import { withBasePath } from "@shadow-shard-tools/docs-core";

const CompareImage = lazy(() => import("react-compare-image"));

interface Props {
  index: number;
  styles: StyleTheme;
  imageCompareData: ImageCompareData;
}

export const ImageCompareBlock: React.FC<Props> = ({
  index,
  styles,
  imageCompareData,
}) => {
  const [sliderPercentage, setSliderPercentage] = useState(50);
  const isMobile = useMobileDevice();

  const scale = validateScale(imageCompareData.scale);
  const alignment = imageCompareData.alignment ?? "center";
  const width = getResponsiveWidth(scale, isMobile);

  const baseClasses = `${SPACING_CLASSES.medium} ${ALIGNMENT_CLASSES[alignment].text}`;
  const containerAlignment = isMobile
    ? "w-full"
    : ALIGNMENT_CLASSES[alignment].container;

  const beforeSrc = imageCompareData.beforeImage?.src
    ? withBasePath(imageCompareData.beforeImage.src, import.meta.env.BASE_URL)
    : "";
  const afterSrc = imageCompareData.afterImage?.src
    ? withBasePath(imageCompareData.afterImage.src, import.meta.env.BASE_URL)
    : "";

  // Compare side-by-side (individual)
  if (imageCompareData.type === "individual" && beforeSrc && afterSrc) {
    return (
      <div key={index} className={baseClasses}>
        <div
          className={`flex gap-4 justify-center ${containerAlignment}`}
          style={{ width }}
        >
          {[imageCompareData.beforeImage, imageCompareData.afterImage].map(
            (img, i) => {
              const src = img?.src
                ? withBasePath(img.src, import.meta.env.BASE_URL)
                : "";
              return (
                <div key={i} className="w-1/2">
                  <img
                    src={src}
                    alt={img?.alt || (i === 0 ? "Before" : "After")}
                    className="w-full h-auto"
                  />
                  {img?.alt && (
                    <p className={`mt-2 ${styles.text.alternative}`}>
                      {img.alt}
                    </p>
                  )}
                </div>
              );
            },
          )}
        </div>
      </div>
    );
  }

  // Slider compare
  if (imageCompareData.type === "slider" && beforeSrc && afterSrc) {
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
            <CompareImage
              leftImage={beforeSrc}
              rightImage={afterSrc}
              sliderLineColor={imageCompareData.sliderColor}
              onSliderPositionChange={(pos: number) =>
                setSliderPercentage(Math.round(pos * 100))
              }
              leftImageCss={{ maxWidth: "100%", height: "auto" }}
              rightImageCss={{ maxWidth: "100%", height: "auto" }}
            />
          </Suspense>
          {imageCompareData.showPercentage &&
            (imageCompareData.beforeImage?.alt ||
              imageCompareData.afterImage?.alt) && (
              <p className={`mt-2 ${styles.text.alternative}`}>
                {imageCompareData.beforeImage?.alt &&
                  `${sliderPercentage}% ${imageCompareData.beforeImage.alt}`}
                {imageCompareData.beforeImage?.alt &&
                  imageCompareData.afterImage?.alt &&
                  " / "}
                {imageCompareData.afterImage?.alt &&
                  `${100 - sliderPercentage}% ${imageCompareData.afterImage.alt}`}
              </p>
            )}
        </div>
      </div>
    );
  }

  return null;
};

export default ImageCompareBlock;
