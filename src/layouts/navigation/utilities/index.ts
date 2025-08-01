import type { FlatEntry } from "../types";
import { KEY_PREFIXES } from "../constants";
import type { StyleTheme } from "../../../types/entities/StyleTheme";
import type { Category } from "../../../types/entities/Category";
import type { DocItem } from "../../../types/entities/DocItem";

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

export const testString = (s: string | undefined, q: string): boolean =>
  s?.toLowerCase().includes(q) ?? false;

export const branchMatches = (node: Category, q: string): boolean =>
  testString(node.title, q) ||
  (node.docs?.some((d) => testString(d.title, q)) ?? false) ||
  (node.children?.some((c) => branchMatches(c, q)) ?? false);

export const createCategoryKey = (id: string): string =>
  `${KEY_PREFIXES.CATEGORY}${id}`;

export const createDocumentKey = (id: string): string =>
  `${KEY_PREFIXES.DOCUMENT}${id}`;

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
        key: createDocumentKey(d.id),
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
      key: createCategoryKey(node.id),
    });

    if (open[node.id]) {
      node.docs?.forEach((d) => {
        if (filter && !testString(d.title, lower)) return;
        list.push({
          type: "doc",
          id: d.id,
          item: d,
          depth: depth + 1,
          key: createDocumentKey(d.id),
        });
      });

      node.children?.forEach((c) => visit(c, depth + 1));
    }
  };

  tree.forEach((n) => visit(n, 0));
  return list;
};

export const filterTree = (tree: Category[], filter: string): Category[] => {
  const lower = filter.toLowerCase();

  const filterBranch = (node: Category): Category | null => {
    if (!branchMatches(node, lower)) return null;
    return {
      ...node,
      children: node.children
        ?.map(filterBranch)
        .filter((c): c is Category => c !== null),
      docs: node.docs?.filter((d) => testString(d.title, lower)),
    };
  };

  return tree.map(filterBranch).filter((c): c is Category => c !== null);
};

export const scrollElementIntoView = (key: string): void => {
  const el = document.querySelector<HTMLElement>(`[data-key="${key}"]`);
  el?.scrollIntoView({ block: "nearest" });
};

export const isTypingInElement = (element: HTMLElement | null): boolean => {
  return element !== null && ["INPUT", "TEXTAREA"].includes(element.tagName);
};
