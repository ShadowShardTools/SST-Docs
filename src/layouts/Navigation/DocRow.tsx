import React, { useMemo } from "react";
import { FileText } from "lucide-react";
import { rowClasses } from "./navigationUtils";
import type { DocItem } from "../../types/entities/DocItem";
import type { StyleTheme } from "../../types/entities/StyleTheme";

export interface DocRowProps {
  doc: DocItem;
  depth: number;
  active: boolean;
  focused: boolean;
  select: (d: DocItem) => void;
  styles: StyleTheme;
}

// forwardRef + memo  ➔ rerenders only when props really change
const DocRowBase = (
  { doc, depth, active, focused, select, styles }: DocRowProps,
  ref: React.Ref<HTMLLIElement>,
) => {
  const cls = useMemo(
    () => rowClasses(active, focused, depth, styles),
    [active, focused, depth, styles],
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
