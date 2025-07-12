import React, { useState } from "react";
import type { StyleTheme } from "../../siteConfig";

import CompareImage from "react-compare-image";

interface ImageCompareSliderBlockProps {
  styles: StyleTheme;
  imageBeforeSrc: string;
  imageBeforeAlt?: string;
  imageAfterSrc: string;
  imageAfterAlt?: string;
  scale?: number; // NEW
}

const ImageCompareSliderBlock: React.FC<ImageCompareSliderBlockProps> = ({
  styles,
  imageBeforeSrc,
  imageBeforeAlt,
  imageAfterSrc,
  imageAfterAlt,
  scale = 1.0,
}) => {
  const [percentage, setPercentage] = useState(50);
  const isValidScale = !isNaN(scale) && scale > 0;
  const widthPercent = `${(isValidScale ? scale : 1) * 100}%`;

  return (
    <div className="mb-6 mx-auto" style={{ width: widthPercent }}>
      <div className={`${styles.components.imageBorder}`}>
        <CompareImage
          leftImage={imageBeforeSrc}
          rightImage={imageAfterSrc}
          sliderLineColor={styles.components.imageCompareSlider}
          onSliderPositionChange={(pos: number) =>
            setPercentage(Math.round(pos * 100))
          }
          leftImageCss={{ maxWidth: "100%", height: "auto" }}
          rightImageCss={{ maxWidth: "100%", height: "auto" }}
        />
      </div>

      {(imageBeforeAlt || imageAfterAlt) && (
        <p className={styles.text.alternativeText}>
          {imageBeforeAlt && `${percentage}% ${imageBeforeAlt}`}
          {imageBeforeAlt && imageAfterAlt && " / "}
          {imageAfterAlt && `${100 - percentage}% ${imageAfterAlt}`}
        </p>
      )}
    </div>
  );
};

export default ImageCompareSliderBlock;
