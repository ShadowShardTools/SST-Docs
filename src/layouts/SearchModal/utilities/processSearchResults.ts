import type { Category, DocItem } from "@shadow-shard-tools/docs-core";
import type { SearchMatch } from "../types";
import { itemMatchesSearchTerm } from "./itemMatchesSearchTerm";

const isCategoryItem = (item: DocItem | Category): item is Category =>
  "docs" in item || "children" in item;

const sliceSnippet = (text: string, lower: string) => {
  const idx = text.toLowerCase().indexOf(lower);
  return `${idx > 0 ? "..." : ""}${text.substring(
    idx - 30 > 0 ? idx - 30 : 0,
    idx + lower.length + 30,
  )}...`;
};

const contentMatchSnippet = (
  item: DocItem | Category,
  lower: string,
): { snippet: string; blockIndex?: number } | null => {
  if (!item.content) return null;

  for (let i = 0; i < item.content.length; i += 1) {
    const block = item.content[i];
    let text = "";

    switch (block.type) {
      case "title":
        if (block.titleData.text?.toLowerCase().includes(lower)) {
          text = block.titleData.text;
        }
        break;
      case "text":
        if (block.textData.text?.toLowerCase().includes(lower)) {
          text = block.textData.text;
        }
        break;
      case "messageBox":
        if (block.messageBoxData.text?.toLowerCase().includes(lower)) {
          text = block.messageBoxData.text;
        }
        break;
      case "list":
        if (
          block.listData.items?.some((li) => li.toLowerCase().includes(lower))
        ) {
          text = block.listData.items.join(" ");
        }
        break;
      case "code":
        if (block.codeData.content?.toLowerCase().includes(lower)) {
          text = block.codeData.content;
        }
        break;
      default:
        text = "";
    }

    if (text) {
      return { snippet: sliceSnippet(text, lower), blockIndex: i };
    }
  }

  return null;
};

export const processSearchResults = (
  results: Array<DocItem | Category>,
  searchTerm: string,
): SearchMatch[] => {
  if (!searchTerm.trim()) return [];

  const termLower = searchTerm.toLowerCase();

  return results
    .filter((item) => itemMatchesSearchTerm(item, searchTerm))
    .map((item) => {
      // Priority: title > description (categories) > content > tags (docs)
      if (item.title.toLowerCase().includes(termLower)) {
        return { item, snippet: item.title };
      }

      if (
        isCategoryItem(item) &&
        item.description &&
        item.description.toLowerCase().includes(termLower)
      ) {
        return { item, snippet: sliceSnippet(item.description, termLower) };
      }

      const contentSnippet = contentMatchSnippet(item, termLower);
      if (contentSnippet) {
        return { item, ...contentSnippet };
      }

      if (!isCategoryItem(item) && item.tags?.length) {
        const tag = item.tags.find((t) => t.toLowerCase().includes(termLower));
        if (tag) {
          return { item, snippet: `Tag: ${tag}` };
        }
      }

      // Fallback to title to avoid duplicates with empty snippet
      return { item, snippet: item.title };
    });
};
