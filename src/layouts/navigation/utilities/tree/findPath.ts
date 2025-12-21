import type { Category } from "@shadow-shard-tools/docs-core";

export const findPath = (tree: Category[], docId: string): string[] => {
  const out: string[] = [];

  const dfs = (nodes: Category[], trail: string[]): boolean => {
    for (const n of nodes) {
      const next = [...trail, n.title];
      if (n.docs?.some((d) => d.id === docId)) {
        out.push(...next);
        return true;
      }
      if (n.children && dfs(n.children, next)) return true;
    }
    return false;
  };

  dfs(tree, []);
  return out;
};

export default findPath;
