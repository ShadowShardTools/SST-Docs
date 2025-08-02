import React from "react";
import type { StyleTheme } from "../../../types/StyleTheme";
import type { TextData } from "../types";

interface Props {
  index: number;
  styles: StyleTheme;
  textData: TextData;
}

const TextBlock: React.FC<Props> = ({ index, styles, textData }) => {
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
