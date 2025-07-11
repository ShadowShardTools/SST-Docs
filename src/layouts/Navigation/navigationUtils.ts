import type { StyleTheme } from "../../siteConfig";
import type { Category } from "../../types/entities/Category";
import type { DocItem } from "../../types/entities/DocItem";

export const rowClasses = (
  active: boolean,
  focused: boolean,
  depth: number,
  styles: StyleTheme,
): string =>
  [
    `flex items-center gap-2 px-2 py-1 cursor-pointer ${styles.components.navigationRowBase}`,
    depth ? "text-sm" : "text-base",
    active ? styles.components.navigationRowActive : "",
    focused && !active ? styles.components.navigationRowFocused : "",
    !active ? styles.components.navigationRowHover : "",
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
    if (!lower && !open[node.id]) {
      list.push({
        type: "category",
        id: node.id,
        depth,
        key: `cat-${node.id}`,
      });
      return;
    }

    list.push({ type: "category", id: node.id, depth, key: `cat-${node.id}` });

    if (open[node.id]) {
      node.docs?.forEach((d) => {
        if (!testString(d.title, lower)) return;
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
