import type { Category, DocItem } from "@shadow-shard-tools/docs-core";
import { useState, useEffect, useCallback, useMemo } from "react";
import { itemMatchesSearchTerm } from "../../searchModal/utilities/itemMatchesSearchTerm";

const flattenCategories = (nodes: Category[]): Category[] => {
  const list: Category[] = [];
  const stack = [...nodes];
  while (stack.length) {
    const current = stack.pop()!;
    list.push(current);
    if (current.children?.length) {
      stack.push(...current.children);
    }
  }
  return list;
};

export const useSearchLogic = (
  items: DocItem[],
  standaloneDocs: DocItem[],
  tree: Category[],
) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Array<DocItem | Category>>(
    [],
  );

  const categories = useMemo(() => flattenCategories(tree), [tree]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    const lower = searchTerm.toLowerCase();
    const allItems: Array<DocItem | Category> = [
      ...items,
      ...standaloneDocs,
      ...categories,
    ];

    const matches = allItems.filter((item) =>
      itemMatchesSearchTerm(item, lower),
    );

    setSearchResults(matches);
  }, [searchTerm, items, standaloneDocs, categories]);

  const resetSearch = useCallback(() => {
    setSearchTerm("");
    setSearchResults([]);
  }, []);

  return { searchTerm, setSearchTerm, searchResults, resetSearch };
};

export default useSearchLogic;
