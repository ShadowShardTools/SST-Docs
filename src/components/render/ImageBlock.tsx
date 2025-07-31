import React, { useState, lazy, Suspense, useEffect } from "react";
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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const scale = imageData.scale ?? 1;
  const isValidScale = scale > 0;

  // Use full width on mobile, apply scale only on desktop
  const getContainerWidth = () => {
    if (isMobile || !isValidScale || scale === 1) {
      return "100%";
    }
    return `${scale * 100}%`;
  };

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

  // Use responsive container alignment
  const getContainerAlignment = () => {
    if (isMobile) return "w-full";
    return containerAlignmentClasses[alignment];
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
          className={getContainerAlignment()}
          style={{ width: getContainerWidth() }}
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
          className={`flex gap-4 justify-center ${getContainerAlignment()}`}
          style={{ width: getContainerWidth() }}
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
          className={getContainerAlignment()}
          style={{ width: getContainerWidth() }}
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
          className={getContainerAlignment()}
          style={{ width: getContainerWidth() }}
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
