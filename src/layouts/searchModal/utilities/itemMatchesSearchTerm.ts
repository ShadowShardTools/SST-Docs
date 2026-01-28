import type {
  Category,
  CodeData,
  DocItem,
} from "@shadow-shard-tools/docs-core";

const codeBlockMatches = (
  codeData: CodeData | null | undefined,
  termLower: string,
): boolean => {
  if (!codeData) return false;

  if (codeData.content?.toLowerCase().includes(termLower)) return true;
  if (codeData.name?.toLowerCase().includes(termLower)) return true;
  if (codeData.language?.toLowerCase().includes(termLower)) return true;

  if (codeData.sections?.length) {
    return codeData.sections.some((section) => {
      if (section.content.toLowerCase().includes(termLower)) return true;
      if (section.filename?.toLowerCase().includes(termLower)) return true;
      return section.language?.toLowerCase().includes(termLower) ?? false;
    });
  }

  return false;
};

type Searchable = DocItem | Category;

export const itemMatchesSearchTerm = (
  item: Searchable,
  term: string,
): boolean => {
  const termLower = term.toLowerCase();

  // Search in title
  if (item.title.toLowerCase().includes(termLower)) return true;

  // Search in description (Category only)
  if ("description" in item) {
    if (item.description?.toLowerCase().includes(termLower)) return true;
  }

  // Search in content blocks
  const hasContentMatch = item.content?.some((content) => {
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
          content.listData.items?.some((entry) =>
            entry.toLowerCase().includes(termLower),
          ) ?? false
        );
      case "messageBox":
        return (
          content.messageBoxData.text?.toLowerCase().includes(termLower) ??
          false
        );
      case "table":
        return (
          content.tableData.data?.some((row) =>
            row.some((cell) => cell.content.toLowerCase().includes(termLower)),
          ) ?? false
        );
      case "code":
        return codeBlockMatches(content.codeData, termLower);
      default:
        return false;
    }
  });

  if (hasContentMatch) return true;

  // Search in tags
  if ("tags" in item) {
    if (item.tags?.some((tag) => tag.toLowerCase().includes(termLower)))
      return true;
  }

  return false;
};
