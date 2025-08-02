import React from "react";
import type { StyleTheme } from "../../../../types/StyleTheme";
import type { TextData } from "../../types";

const TextBlock: React.FC<{
  index: number;
  styles: StyleTheme;
  textData: TextData;
}> = ({ index, styles, textData }) => {
  return (
    <p
      key={index}
      className={`${styles.text.general}`}
      style={{ whiteSpace: "pre-line" }}
    >
      {textData.text}
    </p>
  );
};

export default TextBlock;
