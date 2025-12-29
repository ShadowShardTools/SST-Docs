import type { CodeData, DocItem } from "@shadow-shard-tools/docs-core";

const codeBlockContainsTerm = (
  codeData: CodeData | null | undefined,
  lower: string,
): boolean => {
  if (!codeData) return false;

  if (codeData.content?.toLowerCase().includes(lower)) return true;
  if (codeData.name?.toLowerCase().includes(lower)) return true;
  if (codeData.language?.toLowerCase().includes(lower)) return true;

  if (codeData.sections?.length) {
    return codeData.sections.some((section) => {
      if (section.content.toLowerCase().includes(lower)) return true;
      if (section.filename?.toLowerCase().includes(lower)) return true;
      return section.language?.toLowerCase().includes(lower) ?? false;
    });
  }

  return false;
};

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
        return codeBlockContainsTerm(block.codeData, lower);
      default:
        return false;
    }
  });
};

export default searchInDocItem;
