import type { DocItem } from "@shadow-shard-tools/docs-core";

export const generateSnippet = (item: DocItem, term: string): string => {
  const termLower = term.toLowerCase();

  // First try to find in title
  if (item.title.toLowerCase().includes(termLower)) {
    return item.title;
  }

  // Then search through content blocks
  for (const content of item.content) {
    let text = "";

    switch (content.type) {
      case "text":
        text = content.textData.text ?? "";
        break;
      case "title":
        text = content.titleData.text ?? "";
        break;
      case "messageBox":
        text = content.messageBoxData.text ?? "";
        break;
      case "code":
        text = content.codeData.content ?? "";
        break;
      case "list":
        text = content.listData.items?.join(" ") ?? "";
        break;
      default:
        text = "";
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
