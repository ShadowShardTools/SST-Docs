import type { DocItem } from "#core";
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
