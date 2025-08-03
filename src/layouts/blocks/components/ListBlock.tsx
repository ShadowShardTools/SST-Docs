import React, { useMemo } from "react";
import type { StyleTheme } from "../../../types/StyleTheme";
import type { ListData } from "../types";
import { ALIGNMENT_CLASSES } from "../constants";
import { processListItems } from "../utilities";

interface Props {
  index: number;
  styles: StyleTheme;
  listData: ListData;
}

const ListBlock: React.FC<Props> = ({ index, styles, listData }) => {
  const processedItems = useMemo(
    () => processListItems(listData.items),
    [listData.items],
  );

  if (processedItems.length === 0) return null;

  const ListComponent = listData.type === "ol" ? "ol" : "ul";

  const alignmentClass = ALIGNMENT_CLASSES[listData.alignment || "left"]?.text;

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
