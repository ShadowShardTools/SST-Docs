import React, { useState, lazy, Suspense } from "react";
import type { StyleTheme } from "../../../types/StyleTheme";
import {
  ALIGNMENT_CLASSES,
  SPACING_CLASSES,
  DEFAULT_CAROUSEL_OPTIONS,
} from "../constants";
import { validateScale, getResponsiveWidth } from "../utilities";
import type { ImageData } from "../types";
import { useMobileDevice } from "../hooks";

const Splide = lazy(() =>
  import("@splidejs/react-splide").then((m) => ({ default: m.Splide })),
);
const SplideSlide = lazy(() =>
  import("@splidejs/react-splide").then((m) => ({ default: m.SplideSlide })),
);
const CompareImage = lazy(() => import("react-compare-image"));

interface Props {
  index: number;
  styles: StyleTheme;
  imageData: ImageData;
}

const ImageBlock: React.FC<Props> = ({ index, styles, imageData }) => {
  const [sliderPercentage, setSliderPercentage] = useState(50);
  const isMobile = useMobileDevice();

  const scale = validateScale(imageData.scale);
  const alignment = imageData.alignment ?? "center";

  // Use responsive container alignment
  const getContainerAlignment = () => {
    if (isMobile) return "w-full";
    return ALIGNMENT_CLASSES[alignment].container;
  };

  const baseClasses = `${SPACING_CLASSES.medium} ${ALIGNMENT_CLASSES[alignment].text}`;

  const renderCaption = (caption?: string) => {
    if (!caption) return null;
    return <p className={`mt-2 ${styles.text.alternative}`}>{caption}</p>;
  };

  const renderSingleImage = () => {
    if (!imageData.image) return null;

    return (
      <div key={index} className={baseClasses}>
        <div
          className={getContainerAlignment()}
          style={{ width: getResponsiveWidth(scale, isMobile) }}
        >
          <img
            src={imageData.image.src}
            alt={imageData.image.alt || "Image"}
            className="w-full h-auto"
          />
          {renderCaption(imageData.image.alt)}
        </div>
      </div>
    );
  };

  const renderCompareImages = () => {
    if (!imageData.beforeImage || !imageData.afterImage) return null;

    return (
      <div key={index} className={baseClasses}>
        <div
          className={`flex gap-4 justify-center ${getContainerAlignment()}`}
          style={{ width: getResponsiveWidth(scale, isMobile) }}
        >
          <div className="w-1/2">
            <img
              src={imageData.beforeImage.src}
              alt={imageData.beforeImage.alt || "Before"}
              className="w-full h-auto"
            />
            {renderCaption(imageData.beforeImage.alt)}
          </div>

          <div className="w-1/2">
            <img
              src={imageData.afterImage.src}
              alt={imageData.afterImage.alt || "After"}
              className="w-full h-auto"
            />
            {renderCaption(imageData.afterImage.alt)}
          </div>
        </div>
      </div>
    );
  };

  const renderCarousel = () => {
    if (!imageData.images || imageData.images.length === 0) return null;

    const carouselOptions = {
      ...DEFAULT_CAROUSEL_OPTIONS,
      ...imageData.carouselOptions,
    };

    return (
      <div key={index} className={baseClasses}>
        <div
          className={getContainerAlignment()}
          style={{ width: getResponsiveWidth(scale, isMobile) }}
        >
          <Suspense
            fallback={
              <div className="h-64 bg-gray-200 animate-pulse rounded" />
            }
          >
            <Splide options={carouselOptions}>
              {imageData.images.map((img, i) => (
                <SplideSlide key={i}>
                  <div className="flex flex-col items-center">
                    <img
                      src={img.src}
                      alt={img.alt || `Image ${i + 1}`}
                      className="w-full h-auto"
                    />
                    {renderCaption(img.caption || img.alt)}
                  </div>
                </SplideSlide>
              ))}
            </Splide>
          </Suspense>
        </div>
      </div>
    );
  };

  const renderSliderCompare = () => {
    if (!imageData.beforeImage || !imageData.afterImage) return null;

    return (
      <div key={index} className={baseClasses}>
        <div
          className={getContainerAlignment()}
          style={{ width: getResponsiveWidth(scale, isMobile) }}
        >
          <Suspense
            fallback={
              <div className="h-64 bg-gray-200 animate-pulse rounded" />
            }
          >
            <CompareImage
              leftImage={imageData.beforeImage.src}
              rightImage={imageData.afterImage.src}
              sliderLineColor={imageData.sliderColor}
              onSliderPositionChange={(pos: number) =>
                setSliderPercentage(Math.round(pos * 100))
              }
              leftImageCss={{ maxWidth: "100%", height: "auto" }}
              rightImageCss={{ maxWidth: "100%", height: "auto" }}
            />
          </Suspense>

          {imageData.showPercentage &&
            (imageData.beforeImage.alt || imageData.afterImage.alt) && (
              <p className={`mt-2 ${styles.text.alternative}`}>
                {imageData.beforeImage.alt &&
                  `${sliderPercentage}% ${imageData.beforeImage.alt}`}
                {imageData.beforeImage.alt && imageData.afterImage.alt && " / "}
                {imageData.afterImage.alt &&
                  `${100 - sliderPercentage}% ${imageData.afterImage.alt}`}
              </p>
            )}
        </div>
      </div>
    );
  };

  const renderImageGrid = () => {
    if (!imageData.images || imageData.images.length === 0) return null;

    const cellScale = isMobile || scale <= 0 ? 1 : scale;

    return (
      <div key={index} className={baseClasses}>
        <div
          className={`grid gap-4 sm:grid-cols-2 md:grid-cols-3 ${getContainerAlignment()}`}
        >
          {imageData.images.map((img, i) => (
            <div
              key={i}
              className="flex flex-col items-center"
              style={{
                transform: cellScale !== 1 ? `scale(${cellScale})` : undefined,
                transformOrigin:
                  alignment === "left"
                    ? "left"
                    : alignment === "right"
                      ? "right"
                      : "center",
              }}
            >
              <img
                src={img.src}
                alt={img.alt || `Image ${i + 1}`}
                className="w-full h-auto"
              />
              {renderCaption(img.caption || img.alt)}
            </div>
          ))}
        </div>
      </div>
    );
  };

  switch (imageData.type) {
    case "single":
      return renderSingleImage();
    case "compare":
      return renderCompareImages();
    case "carousel":
      return renderCarousel();
    case "slider":
      return renderSliderCompare();
    case "grid":
      return renderImageGrid();
    default:
      console.warn(`Unknown image type: ${imageData.type}`);
      return null;
  }
};

export default ImageBlock;
