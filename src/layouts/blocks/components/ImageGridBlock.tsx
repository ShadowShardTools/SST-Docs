import React from "react";
import {
  ALIGNMENT_CLASSES,
  SPACING_CLASSES,
} from "@shadow-shard-tools/docs-core";
import { getResponsiveWidth } from "@shadow-shard-tools/docs-core/utilities/dom/getResponsiveWidth";
import { validateScale } from "@shadow-shard-tools/docs-core/utilities/validation/validateScale";
import type { ImageGridData } from "@shadow-shard-tools/docs-core/types/ImageGridData";
import type { StyleTheme } from "@shadow-shard-tools/docs-core/types/StyleTheme";
import { useMobileDevice } from "../hooks";
import { resolveMediaPath } from "../../common/utils/mediaPath";

interface Props {
  index: number;
  styles: StyleTheme;
  imageGridData: ImageGridData;
}

export const ImageGridBlock: React.FC<Props> = ({
  index,
  styles,
  imageGridData,
}) => {
  const isMobile = useMobileDevice();
  const scale = validateScale(imageGridData.scale);
  const alignment = imageGridData.alignment ?? "center";
  const width = getResponsiveWidth(scale, isMobile);

  const baseClasses = `${SPACING_CLASSES.medium} ${ALIGNMENT_CLASSES[alignment].text}`;
  const containerAlignment = isMobile
    ? "w-full"
    : ALIGNMENT_CLASSES[alignment].container;

  if (!imageGridData.images?.length) return null;

  return (
    <div key={index} className={baseClasses}>
      <div className={containerAlignment} style={{ width }}>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {imageGridData.images.map((img, i) => {
            const src = img?.src ? resolveMediaPath(img.src) : "";
            return (
              <div key={i} className="flex flex-col items-center">
                <img
                  src={src}
                  alt={img.alt || `Image ${i + 1}`}
                  className="w-full h-auto"
                />
                {img.alt && (
                  <p className={`${styles.text.caption} mt-2 text-center`}>
                    {img.alt}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ImageGridBlock;
