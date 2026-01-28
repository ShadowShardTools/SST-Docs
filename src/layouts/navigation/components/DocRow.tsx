import React, { useMemo } from "react";
import { FileText } from "lucide-react";
import { rowClasses } from "../utilities";
import type { DocItem, StyleTheme } from "@shadow-shard-tools/docs-core";

export interface Props {
  styles: StyleTheme;
  doc: DocItem;
  depth: number;
  active: boolean;
  focused: boolean;
  select: (d: DocItem) => void;
}

// forwardRef + memo  ➔ rerenders only when props really change
export const DocRowBase = (
  { styles, doc, depth, active, focused, select }: Props,
  ref: React.Ref<HTMLLIElement>,
) => {
  const cls = useMemo(
    () => rowClasses(styles, active, focused, depth),
    [styles, active, focused, depth],
  );

  return (
    <li
      ref={ref}
      data-key={`doc-${doc.id}`}
      role="treeitem"
      aria-selected={focused}
      onClick={() => select(doc)}
      className={cls}
    >
      <FileText className="w-4 h-4 shrink-0" />
      {doc.title}
    </li>
  );
};

export default React.memo(React.forwardRef(DocRowBase));
