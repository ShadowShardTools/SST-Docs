import { useState, useEffect, useCallback } from "react";
import type { DocItem } from "../types";

export const useSearchLogic = (items: DocItem[], standaloneDocs: DocItem[]) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<DocItem[]>([]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    const lower = searchTerm.toLowerCase();
    const allItems = [...items, ...standaloneDocs];

    const matches = allItems.filter(
      (item) =>
        item.title.toLowerCase().includes(lower) ||
        item.content.some((block) => {
          if (block.textData?.text?.toLowerCase().includes(lower)) return true;
          if (block.titleData?.text?.toLowerCase().includes(lower)) return true;
          if (block.messageBoxData?.text?.toLowerCase().includes(lower))
            return true;
          if (
            block.listData?.items?.some((li) =>
              li.toLowerCase().includes(lower),
            )
          )
            return true;
          if (block.codeData?.content?.toLowerCase().includes(lower))
            return true;
          if (block.codeData?.name?.toLowerCase().includes(lower)) return true;
          return false;
        }) ||
        item.tags?.some((tag) => tag.toLowerCase().includes(lower)),
    );

    setSearchResults(matches);
  }, [searchTerm, items, standaloneDocs]);

  const resetSearch = useCallback(() => {
    setSearchTerm("");
    setSearchResults([]);
  }, []);

  return { searchTerm, setSearchTerm, searchResults, resetSearch };
};

export default useSearchLogic;
