import React from "react";
import { branchMatches } from "./navigationUtils";
import DocRow from "./DocRow";
import CategoryRow from "./CategoryRow";
import type { StyleTheme } from "../../siteConfig";
import type { Category } from "../../types/entities/Category";
import type { DocItem } from "../../types/entities/DocItem";

export interface BranchProps {
  node: Category;
  depth: number;
  open: Record<string, boolean>;
  toggle: (id: string) => void;
  filter: string;
  current: DocItem | null | undefined;
  focusedKey: string | null;
  select: (d: DocItem) => void;
  styles: StyleTheme;
}

const Branch: React.FC<BranchProps> = ({
  node,
  depth,
  open,
  toggle,
  filter,
  current,
  focusedKey,
  select,
  styles,
}) => {
  if (!branchMatches(node, filter)) return null;

  const expanded = !!open[node.id];
  const catKey = `cat-${node.id}`;
  const catFocused = focusedKey === catKey;

  return (
    <div className={depth ? "ml-4 space-y-1" : "space-y-1"}>
      <CategoryRow
        ref={null}
        node={node}
        depth={depth}
        expanded={expanded}
        focused={catFocused}
        toggle={toggle}
        styles={styles}
      />

      {expanded && !!node.docs?.length && (
        <ul className="ml-5 space-y-1">
          {node.docs.map((d) => (
            <DocRow
              key={d.id}
              ref={null}
              doc={d}
              depth={depth + 1}
              active={current?.id === d.id}
              focused={focusedKey === `doc-${d.id}`}
              select={select}
              styles={styles}
            />
          ))}
        </ul>
      )}

      {expanded &&
        node.children?.map((c) => (
          <Branch
            key={c.id}
            node={c}
            depth={depth + 1}
            open={open}
            toggle={toggle}
            filter={filter}
            current={current}
            focusedKey={focusedKey}
            select={select}
            styles={styles}
          />
        ))}
    </div>
  );
};

export default Branch;
