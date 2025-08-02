import type { DocItem, Category } from "../types";

export const isCategory = (entry: DocItem | Category): entry is Category => {
  return "docs" in entry || "children" in entry;
};

export default isCategory;
