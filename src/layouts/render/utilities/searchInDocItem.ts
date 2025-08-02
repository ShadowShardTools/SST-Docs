import type { DocItem } from "../types";

export const searchInDocItem = (item: DocItem, searchTerm: string): boolean => {
  const lower = searchTerm.toLowerCase();

  // Search in title
  if (item.title.toLowerCase().includes(lower)) {
    return true;
  }

  // Search in tags
  if (item.tags?.some((tag) => tag.toLowerCase().includes(lower))) {
    return true;
  }

  // Search in content blocks
  return item.content.some((block) => {
    // Check textData
    if (block.textData?.text?.toLowerCase().includes(lower)) {
      return true;
    }

    // Check titleData
    if (block.titleData?.text?.toLowerCase().includes(lower)) {
      return true;
    }

    // Check messageBoxData
    if (block.messageBoxData?.text?.toLowerCase().includes(lower)) {
      return true;
    }

    // Check list items
    if (block.listData?.items?.some((li) => li.toLowerCase().includes(lower))) {
      return true;
    }

    // Check code content
    if (block.codeData?.content?.toLowerCase().includes(lower)) {
      return true;
    }

    // Check code name/filename
    if (block.codeData?.name?.toLowerCase().includes(lower)) {
      return true;
    }

    return false;
  });
};

export default searchInDocItem;
