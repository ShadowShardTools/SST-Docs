import type { DocItem } from "@shadow-shard-tools/docs-core";

export const itemMatchesSearchTerm = (item: DocItem, term: string): boolean => {
  const termLower = term.toLowerCase();

  // Search in title
  if (item.title.toLowerCase().includes(termLower)) return true;

  // Search in content blocks
  const hasContentMatch = item.content.some((content) => {
    switch (content.type) {
      case "text":
        return (
          content.textData.text?.toLowerCase().includes(termLower) ?? false
        );
      case "title":
        return (
          content.titleData.text?.toLowerCase().includes(termLower) ?? false
        );
      case "list":
        return (
          content.listData.items?.some((item) =>
            item.toLowerCase().includes(termLower),
          ) ?? false
        );
      case "messageBox":
        return (
          content.messageBoxData.text?.toLowerCase().includes(termLower) ??
          false
        );
      case "code":
        return (
          content.codeData.content?.toLowerCase().includes(termLower) ||
          content.codeData.name?.toLowerCase().includes(termLower) ||
          false
        );
      default:
        return false;
    }
  });

  if (hasContentMatch) return true;

  // Search in tags
  if (item.tags?.some((tag) => tag.toLowerCase().includes(termLower)))
    return true;

  return false;
};
