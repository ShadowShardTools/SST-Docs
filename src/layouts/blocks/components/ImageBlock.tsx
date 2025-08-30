import React from "react";
import type { StyleTheme } from "../../../application/types/StyleTheme";
import type { ImageData } from "../types";
import { validateScale, getResponsiveWidth } from "../utilities";
import { ALIGNMENT_CLASSES, SPACING_CLASSES } from "../constants";
import { useMobileDevice } from "../hooks";
import { withBasePath } from "../utilities";

interface Props {
  index: number;
  styles: StyleTheme;
  imageData: ImageData;
}

const ImageBlock: React.FC<Props> = ({ index, styles, imageData }) => {
  const isMobile = useMobileDevice();
  const scale = validateScale(imageData.scale);
  const alignment = imageData.alignment ?? "center";
  const width = getResponsiveWidth(scale, isMobile);

  const baseClasses = `${SPACING_CLASSES.medium} ${ALIGNMENT_CLASSES[alignment].text}`;
  const containerAlignment = isMobile ? "w-full" : ALIGNMENT_CLASSES[alignment].container;

  const src = imageData.image ? withBasePath(imageData.image.src) : "";

  return (
    <div key={index} className={baseClasses}>
      <div className={containerAlignment} style={{ width }}>
        {imageData.image && (
          <>
            <img src={src} alt={imageData.image.alt || "Image"} className="w-full h-auto" />
            {imageData.image.alt && (
              <p className={`mt-2 ${styles.text.alternative}`}>{imageData.image.alt}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ImageBlock;
