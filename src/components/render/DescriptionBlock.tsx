import React from "react";
import { type StyleTheme } from "../../config/siteConfig";

const DescriptionBlock: React.FC<{
  index: number;
  styles: StyleTheme;
  content: string;
}> = ({ index, styles, content }) => {
  return (
    <p key={index} className={`${styles.textStyles.general}`}>
      {content}
    </p>
  );
};

export default DescriptionBlock;
