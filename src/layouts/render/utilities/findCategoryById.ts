import type { Category } from "@shadow-shard-tools/docs-core";

export const findCategoryById = (
  nodes: Category[],
  id: string,
): Category | null => {
  for (const cat of nodes) {
    if (cat.id === id) return cat;
    const child = findCategoryById(cat.children ?? [], id);
    if (child) return child;
  }
  return null;
};

export default findCategoryById;
