import React from "react";
import type { StyleTheme } from "../../siteConfig";

interface ImageCompareBlockProps {
  styles: StyleTheme;
  imageBeforeSrc: string;
  imageBeforeAlt?: string;
  imageAfterSrc: string;
  imageAfterAlt?: string;
  scale?: number; // NEW
}

const ImageCompareBlock: React.FC<ImageCompareBlockProps> = ({
  styles,
  imageBeforeSrc,
  imageBeforeAlt,
  imageAfterSrc,
  imageAfterAlt,
  scale = 1.0,
}) => {
  const isValidScale = !isNaN(scale) && scale > 0;
  const widthPercent = `${(isValidScale ? scale : 1) * 100}%`;

  return (
    <div
      className="mb-6 flex gap-4 justify-center mx-auto"
      style={{ width: widthPercent }}
    >
      <div className="w-1/2">
        <img
          src={imageBeforeSrc}
          alt={imageBeforeAlt || "Before"}
          className={`max-w-full h-auto ${styles.components.imageBorder}`}
        />
        {imageBeforeAlt && (
          <p className={styles.text.alternativeText}>{imageBeforeAlt}</p>
        )}
      </div>

      <div className="w-1/2">
        <img
          src={imageAfterSrc}
          alt={imageAfterAlt || "After"}
          className={`max-w-full h-auto ${styles.components.imageBorder}`}
        />
        {imageAfterAlt && (
          <p className={styles.text.alternativeText}>{imageAfterAlt}</p>
        )}
      </div>
    </div>
  );
};

export default ImageCompareBlock;
