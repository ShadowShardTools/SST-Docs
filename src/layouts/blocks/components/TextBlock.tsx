import React from "react";
import type { StyleTheme } from "../../../application/types/StyleTheme";
import type { TextData } from "../types";
import { ALIGNMENT_CLASSES, SPACING_CLASSES } from "../constants";

interface Props {
  index: number;
  styles: StyleTheme;
  textData: TextData;
}

const TextBlock: React.FC<Props> = ({ index, styles, textData }) => {
  // Determine spacing
  const spacingKey = (textData.spacing ??
    "medium") as keyof typeof SPACING_CLASSES;
  const spacingClass = SPACING_CLASSES[spacingKey];

  // Determine alignment
  const alignmentClass = ALIGNMENT_CLASSES[textData.alignment ?? "left"].text;

  return (
    <div key={index} className={spacingClass}>
      <p
        className={`${alignmentClass} ${styles.text.general}`}
        style={{ whiteSpace: "pre-line" }}
      >
        {textData.text}
      </p>
    </div>
  );
};

export default TextBlock;
