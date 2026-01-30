import React, { lazy, Suspense } from "react";
import { useMobileDevice } from "../hooks";
import {
  ALIGNMENT_CLASSES,
  SPACING_CLASSES,
} from "@shadow-shard-tools/docs-core";
import { getResponsiveWidth } from "@shadow-shard-tools/docs-core/utilities/dom/getResponsiveWidth";
import { validateScale } from "@shadow-shard-tools/docs-core/utilities/validation/validateScale";
import type { ImageCompareData } from "@shadow-shard-tools/docs-core/types/ImageCompareData";
import type { StyleTheme } from "@shadow-shard-tools/docs-core/types/StyleTheme";
import { resolveMediaPath } from "../../common/utils/mediaPath";
import { ErrorBoundary } from "../../common/components/ErrorBoundary";

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
  const [position, setPosition] = React.useState(0.5);
  const isMobile = useMobileDevice();

  const scale = validateScale(imageCompareData.scale);
  const alignment = imageCompareData.alignment ?? "center";
  const width = getResponsiveWidth(scale, isMobile);

  const baseClasses = `${SPACING_CLASSES.medium} ${ALIGNMENT_CLASSES[alignment].text}`;
  const containerAlignment = isMobile
    ? "w-full"
    : ALIGNMENT_CLASSES[alignment].container;

  const beforeSrc = imageCompareData.beforeImage?.src
    ? resolveMediaPath(imageCompareData.beforeImage.src)
    : "";
  const afterSrc = imageCompareData.afterImage?.src
    ? resolveMediaPath(imageCompareData.afterImage.src)
    : "";
  const sliderColor = imageCompareData.sliderColor || "#ffffff";

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
              const src = img?.src ? resolveMediaPath(img.src) : "";
              return (
                <div key={i} className="w-1/2">
                  <img
                    src={src}
                    alt={img?.alt || (i === 0 ? "Before" : "After")}
                    className="w-full h-auto"
                  />
                  {img?.alt && (
                    <p className={`${styles.text.caption} mt-2 text-center`}>
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
    const fallback = (
      <div
        className={`flex gap-4 justify-center ${containerAlignment}`}
        style={{ width }}
      >
        <div className="w-1/2">
          <img src={beforeSrc} alt="Before" className="w-full h-auto" />
        </div>
        <div className="w-1/2">
          <img src={afterSrc} alt="After" className="w-full h-auto" />
        </div>
      </div>
    );

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
            <ErrorBoundary name="ImageCompareSlider" fallback={fallback}>
              <CompareImage
                leftImage={beforeSrc}
                rightImage={afterSrc}
                onSliderPositionChange={setPosition}
                sliderLineColor={sliderColor}
                leftImageCss={{ maxWidth: "100%", height: "auto" }}
                rightImageCss={{ maxWidth: "100%", height: "auto" }}
              />
            </ErrorBoundary>
          </Suspense>

          {imageCompareData.showPercentage &&
            (imageCompareData.beforeImage?.alt ||
              imageCompareData.afterImage?.alt) && (
              <p
                className={`mt-2 ${styles.text.alternative} text-center italic`}
              >
                {imageCompareData.beforeImage?.alt &&
                  `${Math.round(position * 100)}% ${imageCompareData.beforeImage.alt}`}
                {imageCompareData.beforeImage?.alt &&
                  imageCompareData.afterImage?.alt &&
                  " / "}
                {imageCompareData.afterImage?.alt &&
                  `${100 - Math.round(position * 100)}% ${imageCompareData.afterImage.alt}`}
              </p>
            )}
        </div>
      </div>
    );
  }

  return null;
};

export default ImageCompareBlock;
