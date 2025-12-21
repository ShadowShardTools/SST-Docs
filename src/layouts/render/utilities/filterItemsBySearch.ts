import type { DocItem } from "@shadow-shard-tools/docs-core";
import searchInDocItem from "./searchInDocItem";

export const filterItemsBySearch = (
  items: DocItem[],
  standaloneDocs: DocItem[],
  searchTerm: string,
): DocItem[] => {
  if (!searchTerm.trim()) {
    return [];
  }

  const allItems = [...items, ...standaloneDocs];
  return allItems.filter((item) => searchInDocItem(item, searchTerm));
};

export default filterItemsBySearch;
