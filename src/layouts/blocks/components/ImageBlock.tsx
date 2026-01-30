import React from "react";
import {
  ALIGNMENT_CLASSES,
  SPACING_CLASSES,
} from "@shadow-shard-tools/docs-core";
import { getResponsiveWidth } from "@shadow-shard-tools/docs-core/utilities/dom/getResponsiveWidth";
import { validateScale } from "@shadow-shard-tools/docs-core/utilities/validation/validateScale";
import type { ImageData } from "@shadow-shard-tools/docs-core/types/ImageData";
import type { StyleTheme } from "@shadow-shard-tools/docs-core/types/StyleTheme";
import { useMobileDevice } from "../hooks";
import { resolveMediaPath } from "../../common/utils/mediaPath";

interface Props {
  index: number;
  styles: StyleTheme;
  imageData: ImageData;
}

export const ImageBlock: React.FC<Props> = ({ index, styles, imageData }) => {
  const isMobile = useMobileDevice();
  const scale = validateScale(imageData.scale);
  const alignment = imageData.alignment ?? "center";
  const width = getResponsiveWidth(scale, isMobile);

  const baseClasses = `${SPACING_CLASSES.medium} ${ALIGNMENT_CLASSES[alignment].text}`;
  const containerAlignment = isMobile
    ? "w-full"
    : ALIGNMENT_CLASSES[alignment].container;

  const src = imageData.image ? resolveMediaPath(imageData.image.src) : "";

  return (
    <div key={index} className={baseClasses}>
      <div className={containerAlignment} style={{ width }}>
        {imageData.image && (
          <>
            <img
              src={src}
              alt={imageData.image.alt || "Image"}
              className="w-full h-auto"
            />
            {imageData.image.alt && (
              <p className={`${styles.text.caption} mt-2 text-center`}>
                {imageData.image.alt}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ImageBlock;
