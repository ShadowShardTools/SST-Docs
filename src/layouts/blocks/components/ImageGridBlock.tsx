import React from "react";
import type { StyleTheme } from "../../../application/types/StyleTheme";
import type { ImageGridData } from "../types";
import { validateScale } from "../utilities";
import { useMobileDevice } from "../hooks";
import { ALIGNMENT_CLASSES, SPACING_CLASSES } from "../constants";
import { withBasePath } from "../utilities";

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

  const baseClasses = `${SPACING_CLASSES.medium} ${ALIGNMENT_CLASSES[alignment].text}`;
  const containerAlignment = isMobile
    ? "w-full"
    : ALIGNMENT_CLASSES[alignment].container;

  if (!imageGridData.images?.length) return null;

  const cellScale = isMobile || scale <= 0 ? 1 : scale;

  return (
    <div key={index} className={baseClasses}>
      <div
        className={`grid gap-4 sm:grid-cols-2 md:grid-cols-3 ${containerAlignment}`}
      >
        {imageGridData.images.map((img, i) => {
          const src = img?.src ? withBasePath(img.src) : "";
          return (
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
                src={src}
                alt={img.alt || `Image ${i + 1}`}
                className="w-full h-auto"
              />
              {img.alt && (
                <p className={`mt-2 ${styles.text.alternative}`}>{img.alt}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ImageGridBlock;
