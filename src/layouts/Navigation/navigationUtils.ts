import type { StyleTheme } from "../../types/entities/StyleTheme";
import type { Category } from "../../types/entities/Category";
import type { DocItem } from "../../types/entities/DocItem";

export const rowClasses = (
  styles: StyleTheme,
  active: boolean,
  focused: boolean,
  depth: number,
): string =>
  [
    `flex items-center gap-2 px-2 py-1 cursor-pointer ${styles.navigation.row}`,
    depth ? "text-sm" : "text-base",
    active ? styles.navigation.rowActive : "",
    focused && !active ? styles.navigation.rowFocused : "",
    !active ? styles.navigation.rowHover : "",
  ].join(" ");

export const testString = (s: string | undefined, q: string) =>
  s?.toLowerCase().includes(q) ?? false;

export const branchMatches = (node: Category, q: string): boolean =>
  testString(node.title, q) ||
  (node.docs?.some((d) => testString(d.title, q)) ?? false) ||
  (node.children?.some((c) => branchMatches(c, q)) ?? false);

/* -------------------------------------------------------------------------- */
/*                               Flat list util                               */
/* -------------------------------------------------------------------------- */

export interface FlatEntryDoc {
  type: "doc";
  id: string;
  item: DocItem;
  depth: number;
  key: string; // doc-${id}
}
export interface FlatEntryCat {
  type: "category";
  id: string;
  node: Category;
  depth: number;
  key: string; // cat-${id}
}
export type FlatEntry = FlatEntryDoc | FlatEntryCat;

/** Build a flat list of nav rows (used for cursor / hotkeys). */
export const buildEntries = (
  tree: Category[],
  standaloneDocs: DocItem[],
  open: Record<string, boolean>,
  filter: string,
): FlatEntry[] => {
  const list: FlatEntry[] = [];
  const lower = filter.toLowerCase();

  // standalone docs first (depth 0)
  standaloneDocs
    .filter((d) => testString(d.title, lower))
    .forEach((d) =>
      list.push({
        type: "doc",
        id: d.id,
        item: d,
        depth: 0,
        key: `doc-${d.id}`,
      }),
    );

  const visit = (node: Category, depth: number): void => {
    // Skip the category if it doesn't match the filter at all
    if (filter && !branchMatches(node, lower)) return;

    list.push({
      type: "category",
      id: node.id,
      node,
      depth,
      key: `cat-${node.id}`,
    });

    if (open[node.id]) {
      node.docs?.forEach((d) => {
        if (filter && !testString(d.title, lower)) return;
        list.push({
          type: "doc",
          id: d.id,
          item: d,
          depth: depth + 1,
          key: `doc-${d.id}`,
        });
      });

      node.children?.forEach((c) => visit(c, depth + 1));
    }
  };

  tree.forEach((n) => visit(n, 0));
  return list;
};
