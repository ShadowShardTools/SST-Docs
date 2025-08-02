import React, { useMemo } from "react";
import type { StyleTheme } from "../../../types/StyleTheme";
import type { ListData } from "../types";

interface Props {
  index: number;
  styles: StyleTheme;
  listData: ListData;
}

const ListBlock: React.FC<Props> = ({ index, styles, listData }) => {
  const processedItems = useMemo(() => {
    return (listData.items ?? [])
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }, [listData.items]);

  if (processedItems.length === 0) return null;

  const ListComponent = listData.type === "ol" ? "ol" : "ul";

  const alignmentClass =
    listData.alignment === "center"
      ? "text-center"
      : listData.alignment === "right"
        ? "text-right"
        : "text-left";

  const listClass = [
    styles.text.list,
    listData.type === "ol" ? "list-decimal" : "list-disc",
    listData.inside ? "ml-4" : "",
    alignmentClass,
  ].join(" ");

  return (
    <ListComponent
      key={index}
      className={listClass}
      {...(listData.type === "ol" && listData.startNumber !== undefined
        ? { start: listData.startNumber }
        : {})}
      role="list"
      aria-label={listData.ariaLabel}
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
