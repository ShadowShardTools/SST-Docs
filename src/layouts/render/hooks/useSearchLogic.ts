import type { DocItem } from "@shadow-shard-tools/docs-core";
import { useState, useEffect, useCallback } from "react";

function blockMatches(
  block: DocItem["content"][number],
  lower: string,
): boolean {
  switch (block.type) {
    case "text":
      return block.textData.text?.toLowerCase().includes(lower) ?? false;
    case "title":
      return block.titleData.text?.toLowerCase().includes(lower) ?? false;
    case "messageBox":
      return block.messageBoxData.text?.toLowerCase().includes(lower) ?? false;
    case "list":
      return (
        block.listData.items?.some((li) => li.toLowerCase().includes(lower)) ??
        false
      );
    case "code":
      return (
        block.codeData.content?.toLowerCase().includes(lower) ||
        block.codeData.name?.toLowerCase().includes(lower) ||
        false
      );
    default:
      return false;
  }
}

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
        item.content.some((block) => blockMatches(block, lower)) ||
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
