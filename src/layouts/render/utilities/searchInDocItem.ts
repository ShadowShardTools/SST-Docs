import type { DocItem } from "@shadow-shard-tools/docs-core";

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
    switch (block.type) {
      case "text":
        return block.textData.text?.toLowerCase().includes(lower) ?? false;
      case "title":
        return block.titleData.text?.toLowerCase().includes(lower) ?? false;
      case "messageBox":
        return (
          block.messageBoxData.text?.toLowerCase().includes(lower) ?? false
        );
      case "list":
        return (
          block.listData.items?.some((li) =>
            li.toLowerCase().includes(lower),
          ) ?? false
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
  });
};

export default searchInDocItem;
