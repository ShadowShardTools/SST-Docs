import React from "react";
import type { StyleTheme } from "../../siteConfig";

interface ImageBlockProps {
  styles: StyleTheme;
  imageSrc: string;
  imageAlt?: string;
  scale?: number;
}

const ImageBlock: React.FC<ImageBlockProps> = ({
  styles,
  imageSrc,
  imageAlt,
  scale = 1.0,
}) => {
  const isValidScale = !isNaN(scale) && scale > 0;
  const widthPercent = `${(isValidScale ? scale : 1) * 100}%`;

  return (
    <div className="mb-6 text-center">
      <img
        src={imageSrc}
        alt={imageAlt || "Image"}
        style={{ width: widthPercent }}
        className={`inline-block h-auto ${styles.components.imageBorder}`}
      />
      {imageAlt && <p className={styles.text.alternativeText}>{imageAlt}</p>}
    </div>
  );
};

export default ImageBlock;
