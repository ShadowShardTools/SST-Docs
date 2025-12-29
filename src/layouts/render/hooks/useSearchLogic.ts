import type { Category, DocItem } from "@shadow-shard-tools/docs-core";
import { useState, useEffect, useCallback, useMemo } from "react";
import { itemMatchesSearchTerm } from "../../searchModal/utilities/itemMatchesSearchTerm";

const SEARCH_DEBOUNCE_MS = 200;

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
  const [debouncedTerm, setDebouncedTerm] = useState("");

  const categories = useMemo(() => flattenCategories(tree), [tree]);
  const allItems = useMemo(
    () => [...items, ...standaloneDocs, ...categories],
    [items, standaloneDocs, categories],
  );

  // Delay running expensive search work while the user is typing
  useEffect(() => {
    if (!searchTerm.trim()) {
      setDebouncedTerm("");
      return;
    }

    const handle = setTimeout(
      () => setDebouncedTerm(searchTerm),
      SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(handle);
  }, [searchTerm]);

  useEffect(() => {
    if (!debouncedTerm.trim()) {
      setSearchResults([]);
      return;
    }

    const matches = allItems.filter((item) =>
      itemMatchesSearchTerm(item, debouncedTerm),
    );

    setSearchResults(matches);
  }, [debouncedTerm, allItems]);

  const resetSearch = useCallback(() => {
    setSearchTerm("");
    setSearchResults([]);
    setDebouncedTerm("");
  }, []);

  return {
    searchTerm,
    debouncedSearchTerm: debouncedTerm,
    setSearchTerm,
    searchResults,
    resetSearch,
  };
};

export default useSearchLogic;
