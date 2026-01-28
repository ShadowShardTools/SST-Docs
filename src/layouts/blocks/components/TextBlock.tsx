import React from "react";
import {
  ALIGNMENT_CLASSES,
  SPACING_CLASSES,
} from "@shadow-shard-tools/docs-core";
import type { StyleTheme } from "@shadow-shard-tools/docs-core";
import type { TextData } from "@shadow-shard-tools/docs-core";
import { sanitizeRichText } from "../../common/utils/richText";

interface Props {
  index: number;
  styles: StyleTheme;
  textData: TextData;
}

export const TextBlock: React.FC<Props> = ({ index, styles, textData }) => {
  const spacingClass = SPACING_CLASSES.medium;

  // Determine alignment
  const alignmentClass = ALIGNMENT_CLASSES[textData.alignment ?? "left"].text;

  return (
    <div key={index} className={spacingClass}>
      <p
        className={`${alignmentClass} ${styles.text.general}`}
        dangerouslySetInnerHTML={{
          __html: sanitizeRichText(textData.text ?? "", styles),
        }}
      />
    </div>
  );
};

export default TextBlock;
