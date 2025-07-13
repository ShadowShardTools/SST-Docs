import React, { useState, lazy, Suspense } from "react";
import type { StyleTheme } from "../../types/entities/StyleTheme";
import type { ImageData } from "../../types/data/ImageData";

const Splide = lazy(() =>
  import("@splidejs/react-splide").then((m) => ({ default: m.Splide })),
);
const SplideSlide = lazy(() =>
  import("@splidejs/react-splide").then((m) => ({ default: m.SplideSlide })),
);
const CompareImage = lazy(() => import("react-compare-image"));

interface ImageBlockProps {
  index: number;
  styles: StyleTheme;
  imageData: ImageData;
}

const ImageBlock: React.FC<ImageBlockProps> = ({
  index,
  styles,
  imageData,
}) => {
  const [sliderPercentage, setSliderPercentage] = useState(50);

  const scale = imageData.scale ?? 1;
  const isValidScale = scale > 0;
  const widthPercent = `${(isValidScale ? scale : 1) * 100}%`;

  const alignment = imageData.alignment ?? "center";

  const alignmentClasses = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  const containerAlignmentClasses = {
    left: "mr-auto",
    center: "mx-auto",
    right: "ml-auto",
  };

  const baseClasses = `mb-6 ${alignmentClasses[alignment]}`;

  const renderCaption = (caption?: string) => {
    if (!caption) return null;
    return <p className={`mt-2 ${styles.text.alternative}`}>{caption}</p>;
  };

  const renderSingleImage = () => {
    if (!imageData.image) return null;

    return (
      <div key={index} className={baseClasses}>
        <div
          className={containerAlignmentClasses[alignment]}
          style={{ width: widthPercent }}
        >
          <img
            src={imageData.image.src}
            alt={imageData.image.alt || "Image"}
            className={`w-full h-auto`}
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
          className={`flex gap-4 justify-center ${containerAlignmentClasses[alignment]}`}
          style={{ width: widthPercent }}
        >
          <div className="w-1/2">
            <img
              src={imageData.beforeImage.src}
              alt={imageData.beforeImage.alt || "Before"}
              className={`w-full h-auto`}
            />
            {renderCaption(imageData.beforeImage.alt)}
          </div>

          <div className="w-1/2">
            <img
              src={imageData.afterImage.src}
              alt={imageData.afterImage.alt || "After"}
              className={`w-full h-auto`}
            />
            {renderCaption(imageData.afterImage.alt)}
          </div>
        </div>
      </div>
    );
  };

  const renderCarousel = () => {
    if (!imageData.images || imageData.images.length === 0) return null;

    const defaultOptions = {
      type: "loop" as const,
      gap: "1rem",
      arrows: true,
      pagination: false,
      autoplay: false,
      interval: 3000,
      ...imageData.carouselOptions,
    };

    return (
      <div key={index} className={baseClasses}>
        <div
          className={containerAlignmentClasses[alignment]}
          style={{ width: widthPercent }}
        >
          <Suspense
            fallback={
              <div className="h-64 bg-gray-200 animate-pulse rounded" />
            }
          >
            <Splide options={defaultOptions}>
              {imageData.images.map((img, i) => (
                <SplideSlide key={i}>
                  <div className="flex flex-col items-center">
                    <img
                      src={img.src}
                      alt={img.alt || `Image ${i + 1}`}
                      className={`w-full h-auto`}
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
          className={containerAlignmentClasses[alignment]}
          style={{ width: widthPercent }}
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
                {imageData.beforeImage.alt &&
                  imageData.afterImage.alt &&
                  " / "}
                {imageData.afterImage.alt &&
                  `${100 - sliderPercentage}% ${imageData.afterImage.alt}`}
              </p>
            )}
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
    default:
      console.warn(`Unknown image type: ${imageData.type}`);
      return null;
  }
};

export default ImageBlock;
