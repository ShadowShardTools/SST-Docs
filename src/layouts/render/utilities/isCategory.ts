import type { Category, DocItem } from "@shadow-shard-tools/docs-core";

export const isCategory = (entry: DocItem | Category): entry is Category => {
  return "docs" in entry || "children" in entry;
};

export default isCategory;
