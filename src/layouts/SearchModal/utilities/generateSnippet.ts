import type { DocItem } from "../../../types/entities/DocItem";

export const generateSnippet = (item: DocItem, term: string): string => {
  const termLower = term.toLowerCase();

  // First try to find in title
  if (item.title.toLowerCase().includes(termLower)) {
    return item.title;
  }

  // Then search through content blocks
  for (const content of item.content) {
    let text = "";

    if (content.textData?.text) {
      text = content.textData.text;
    } else if (content.titleData?.text) {
      text = content.titleData.text;
    } else if (content.messageBoxData?.text) {
      text = content.messageBoxData.text;
    } else if (content.codeData?.content) {
      text = content.codeData.content;
    } else if (content.listData?.items) {
      text = content.listData.items.join(" ");
    }

    if (text && text.toLowerCase().includes(termLower)) {
      const index = text.toLowerCase().indexOf(termLower);
      const start = Math.max(0, index - 50);
      const end = Math.min(text.length, index + term.length + 50);
      let snippet = text.substring(start, end);

      if (start > 0) snippet = "..." + snippet;
      if (end < text.length) snippet = snippet + "...";

      return snippet;
    }
  }

  // Fallback to tags
  if (item.tags) {
    const matchingTag = item.tags.find((tag) =>
      tag.toLowerCase().includes(termLower),
    );
    if (matchingTag) {
      return `Tag: ${matchingTag}`;
    }
  }

  return "";
};