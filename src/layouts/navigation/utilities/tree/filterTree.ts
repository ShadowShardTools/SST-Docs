import type { Category } from "../../../render/types";
import branchMatches from "./branchMatches";
import testString from "../string/testString";

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

export default filterTree;
