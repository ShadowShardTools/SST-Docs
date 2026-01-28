import React, { useMemo } from "react";
import { ALIGNMENT_CLASSES } from "@shadow-shard-tools/docs-core";
import { processListItems } from "@shadow-shard-tools/docs-core/utilities/string/processListItems";
import type { ListData } from "@shadow-shard-tools/docs-core/types/ListData";
import type { StyleTheme } from "@shadow-shard-tools/docs-core/types/StyleTheme";
import { sanitizeRichText } from "../../common/utils/richText";

interface Props {
  index: number;
  styles: StyleTheme;
  listData: ListData;
}

export const ListBlock: React.FC<Props> = ({ index, styles, listData }) => {
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
      className={`mb-2 ${listClass}`}
      {...(listData.type === "ol" && listData.startNumber !== undefined
        ? { start: listData.startNumber }
        : {})}
      role="list"
      aria-label={listData.ariaLabel}
    >
      {processedItems.map((item, i) => (
        <li
          key={i}
          role="listitem"
          dangerouslySetInnerHTML={{ __html: sanitizeRichText(item, styles) }}
        />
      ))}
    </ListComponent>
  );
};

export default ListBlock;
