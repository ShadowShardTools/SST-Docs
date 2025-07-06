import React from "react";
import { type StyleTheme } from "../../config/siteConfig";

const ListBlock: React.FC<{
  index: number;
  styles: StyleTheme;
  listItems?: string[];
}> = ({ index, styles, listItems }) => (
  <ul key={index} className={`${styles.textStyles.list}`}>
    {listItems?.map((item, i) => (
      <li key={i}>{item}</li>
    ))}
  </ul>
);

export default ListBlock;
