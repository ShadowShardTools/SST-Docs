import React from "react";
import CategoryRow from "./CategoryRow";
import DocRow from "./DocRow";
import type {
  Category,
  DocItem,
  StyleTheme,
} from "@shadow-shard-tools/docs-core";

export interface Props {
  node: Category;
  depth: number;
  open: Record<string, boolean>;
  toggle: (id: string) => void;
  filter: string;
  current: DocItem | Category | null | undefined;
  focusedKey: string | null;
  select: (d: DocItem | Category) => void;
  styles: StyleTheme;
}

export const Branch: React.FC<Props> = ({
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
  const expanded = !!open[node.id];
  const catKey = `cat-${node.id}`;
  const catFocused = focusedKey === catKey;

  const isCurrentCategory =
    current && "docs" in current && current.id === node.id;

  return (
    <div className={depth ? "ml-4 space-y-1" : "space-y-1"}>
      <CategoryRow
        ref={null}
        node={node}
        depth={depth}
        active={Boolean(isCurrentCategory)}
        expanded={expanded}
        focused={catFocused}
        toggle={toggle}
        select={select}
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
