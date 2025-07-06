import React from "react";
import type { StyleTheme } from "../../config/siteConfig";

const QuoteBlock: React.FC<{
  index: number;
  styles: StyleTheme;
  content: string;
}> = ({ index, styles, content }) => (
  <blockquote key={index} className={`${styles.componentsStyles.quote}`}>
    <p className={`${styles.textStyles.quote}`}>{content}</p>
  </blockquote>
);

export default QuoteBlock;
