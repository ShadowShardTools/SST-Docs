import type { DocItem } from "@shadow-shard-tools/docs-core";
import type { SearchMatch } from "../types";
import { itemMatchesSearchTerm } from "./itemMatchesSearchTerm";

export const processSearchResults = (
  results: DocItem[],
  searchTerm: string,
): SearchMatch[] => {
  if (!searchTerm.trim()) return [];

  const termLower = searchTerm.toLowerCase();

  return results
    .filter((item) => itemMatchesSearchTerm(item, searchTerm))
    .flatMap((item) => {
      const matches: SearchMatch[] = [];

      // Check title match
      if (item.title.toLowerCase().includes(termLower)) {
        matches.push({ item, snippet: item.title });
      }

      // Check content blocks
      item.content.forEach((block, blockIndex) => {
        let text = "";
        switch (block.type) {
          case "title":
            if (block.titleData.text?.toLowerCase().includes(termLower)) {
              text = block.titleData.text;
            }
            break;
          case "text":
            if (block.textData.text?.toLowerCase().includes(termLower)) {
              text = block.textData.text;
            }
            break;
          case "messageBox":
            if (block.messageBoxData.text?.toLowerCase().includes(termLower)) {
              text = block.messageBoxData.text;
            }
            break;
          case "list":
            if (
              block.listData.items?.some((li) =>
                li.toLowerCase().includes(termLower),
              )
            ) {
              text = block.listData.items.join(" ");
            }
            break;
          case "code":
            if (block.codeData.content?.toLowerCase().includes(termLower)) {
              text = block.codeData.content;
            }
            break;
          default:
            text = "";
        }

        if (text) {
          const idx = text.toLowerCase().indexOf(termLower);
          const snippet = `${idx > 0 ? "..." : ""}${text.substring(
            idx - 30 > 0 ? idx - 30 : 0,
            idx + termLower.length + 30,
          )}...`;
          matches.push({ item, snippet, blockIndex });
        }
      });

      // Check tags
      item.tags?.forEach((tag) => {
        if (tag.toLowerCase().includes(termLower)) {
          matches.push({ item, snippet: `Tag: ${tag}` });
        }
      });

      return matches;
    });
};
