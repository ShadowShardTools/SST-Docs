import type { CodeData, DocItem } from "@shadow-shard-tools/docs-core";

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, "");

const normalizeText = (value: string | null | undefined) =>
  stripHtml(value ?? "").toLowerCase();

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
  if (normalizeText(item.title).includes(lower)) {
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
        return normalizeText(block.textData.text).includes(lower);
      case "title":
        return normalizeText(block.titleData.text).includes(lower);
      case "messageBox":
        return normalizeText(block.messageBoxData.text).includes(lower);
      case "list":
        return (
          block.listData.items?.some((li) =>
            normalizeText(li).includes(lower),
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
