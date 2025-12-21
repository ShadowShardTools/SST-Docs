import React, { useMemo } from "react";
import { Folder, ChevronDown, ChevronRight } from "lucide-react";
import { rowClasses } from "../utilities";
import type { Category, StyleTheme } from "@shadow-shard-tools/docs-core";

export interface Props {
  styles: StyleTheme;
  node: Category;
  depth: number;
  active: boolean;
  expanded: boolean;
  focused: boolean;
  toggle: (id: string) => void;
  select: (c: Category) => void;
}

export const CategoryRowBase = (
  { styles, node, depth, active, expanded, focused, toggle, select }: Props,
  ref: React.Ref<HTMLButtonElement>,
) => {
  const cls = useMemo(
    () => rowClasses(styles, active, focused, depth),
    [styles, active, focused, depth],
  );

  return (
    <button
      ref={ref}
      data-key={`cat-${node.id}`}
      role="treeitem"
      aria-expanded={expanded}
      aria-selected={focused}
      onClick={() => {
        select(node);
        if (!expanded) toggle(node.id);
      }}
      className={cls}
      style={{ justifyContent: "space-between", width: "100%" }}
    >
      <span className="flex items-center gap-2">
        <Folder className="w-4 h-4 shrink-0" />
        {node.title}
      </span>
      <span
        onClick={(e) => {
          e.stopPropagation();
          toggle(node.id);
        }}
      >
        {expanded ? (
          <ChevronDown className="w-5 h-5 shrink-0" />
        ) : (
          <ChevronRight className="w-5 h-5 shrink-0" />
        )}
      </span>
    </button>
  );
};

export default React.memo(React.forwardRef(CategoryRowBase));
