import React from "react";
import type { StyleTheme } from "../../types/entities/StyleTheme";
import type { TextData } from "../../types/data/TextData";

const TextBlock: React.FC<{
  index: number;
  styles: StyleTheme;
  textData: TextData;
}> = ({ index, styles, textData }) => {
  return (
    <p key={index} className={`${styles.text.general}`}>
      {textData.text}
    </p>
  );
};

export default TextBlock;
