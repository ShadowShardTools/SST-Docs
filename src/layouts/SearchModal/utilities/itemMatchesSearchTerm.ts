import type { DocItem } from "../../render/types/DocItem";

export const itemMatchesSearchTerm = (item: DocItem, term: string): boolean => {
  const termLower = term.toLowerCase();

  // Search in title
  if (item.title.toLowerCase().includes(termLower)) return true;

  // Search in content blocks
  const hasContentMatch = item.content.some((content) => {
    if (content.textData?.text?.toLowerCase().includes(termLower)) return true;
    if (content.titleData?.text?.toLowerCase().includes(termLower)) return true;
    if (
      content.listData?.items?.some((item) =>
        item.toLowerCase().includes(termLower),
      )
    )
      return true;
    if (content.messageBoxData?.text?.toLowerCase().includes(termLower))
      return true;
    if (content.codeData?.content?.toLowerCase().includes(termLower))
      return true;
    if (content.codeData?.name?.toLowerCase().includes(termLower)) return true;
    return false;
  });

  if (hasContentMatch) return true;

  // Search in tags
  if (item.tags?.some((tag) => tag.toLowerCase().includes(termLower)))
    return true;

  return false;
};
