import React from "react";
import { type StyleTheme } from "../../siteConfig";

const DescriptionBlock: React.FC<{
  index: number;
  styles: StyleTheme;
  content: string;
}> = ({ index, styles, content }) => {
  return (
    <p key={index} className={`${styles.text.general}`}>
      {content}
    </p>
  );
};

export default DescriptionBlock;
