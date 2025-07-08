import React, { useMemo } from "react";
import { Folder, ChevronDown, ChevronRight } from "lucide-react";
import { rowClasses } from "./navigationUtils";
import type { StyleTheme } from "../../siteConfig";
import type { Category } from "../../types/entities/Category";

export interface CategoryRowProps {
  node: Category;
  depth: number;
  expanded: boolean;
  focused: boolean;
  toggle: (id: string) => void;
  styles: StyleTheme;
}

const CategoryRowBase = (
  { node, depth, expanded, focused, toggle, styles }: CategoryRowProps,
  ref: React.Ref<HTMLButtonElement>,
) => {
  const cls = useMemo(
    () => rowClasses(false, focused, depth, styles),
    [focused, depth, styles],
  );

  return (
    <button
      ref={ref}
      data-key={`cat-${node.id}`}
      role="treeitem"
      aria-expanded={expanded}
      aria-selected={focused}
      onClick={() => toggle(node.id)}
      className={cls}
      style={{ justifyContent: "space-between", width: "100%" }}
    >
      <span className="flex items-center gap-2">
        <Folder className="w-4 h-4 shrink-0" />
        {node.title}
      </span>
      {expanded ? (
        <ChevronDown className="w-4 h-4 shrink-0" />
      ) : (
        <ChevronRight className="w-4 h-4 shrink-0" />
      )}
    </button>
  );
};

export default React.memo(React.forwardRef(CategoryRowBase));
