import type { FlatEntry } from "../../types";
import branchMatches from "./branchMatches";
import createCategoryKey from "./createCategoryKey";
import createDocumentKey from "./createDocumentKey";
import testString from "../string/testString";
import type { Category, DocItem } from "@shadow-shard-tools/docs-core";

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

export default buildEntries;
