import React, { useMemo } from "react";
import { type StyleTheme } from "../../siteConfig";

interface ListBlockProps {
  index: number;
  styles: StyleTheme;
  listItems?: string[];
  listType?: "ul" | "ol";
  listStartNumber?: number;
  listAriaLabel?: string;
  listInside?: boolean;
}

const ListBlock: React.FC<ListBlockProps> = ({
  index,
  styles,
  listItems = [],
  listType = "ul",
  listStartNumber,
  listAriaLabel,
  listInside = false,
}) => {
  const processedItems = useMemo(() => {
    return listItems
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }, [listItems]);

  if (processedItems.length === 0) return null;

  const ListComponent = listType === "ol" ? "ol" : "ul";

  const listClass = [
    styles.text.list,
    listType === "ol" ? "list-decimal" : "list-disc",
    listInside ? "list-inside" : "",
  ].join(" ");

  return (
    <ListComponent
      key={index}
      className={listClass}
      {...(listType === "ol" && listStartNumber !== undefined
        ? { start: listStartNumber }
        : {})}
      role="list"
      aria-label={listAriaLabel}
    >
      {processedItems.map((item, i) => (
        <li key={i} role="listitem">
          {item}
        </li>
      ))}
    </ListComponent>
  );
};

export default ListBlock;
