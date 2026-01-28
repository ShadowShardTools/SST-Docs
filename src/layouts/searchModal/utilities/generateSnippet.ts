import type { CodeData, DocItem } from "@shadow-shard-tools/docs-core";

const getCodeSnippet = (
  codeData: CodeData | null | undefined,
  termLower: string,
): string => {
  if (!codeData) return "";

  if (codeData.content?.toLowerCase().includes(termLower)) {
    return codeData.content;
  }

  if (codeData.sections?.length) {
    for (const section of codeData.sections) {
      if (section.content.toLowerCase().includes(termLower)) {
        return section.content;
      }
      if (section.filename?.toLowerCase().includes(termLower)) {
        return section.filename;
      }
      if (section.language?.toLowerCase().includes(termLower)) {
        return section.language ?? "";
      }
    }
  }

  if (codeData.name?.toLowerCase().includes(termLower)) {
    return codeData.name;
  }

  if (codeData.language?.toLowerCase().includes(termLower)) {
    return codeData.language;
  }

  return "";
};

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
        text = getCodeSnippet(content.codeData, termLower);
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
