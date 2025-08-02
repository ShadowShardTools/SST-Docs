import type { DocItem } from "../../render/types/DocItem";
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
        if (block.titleData?.text?.toLowerCase().includes(termLower)) {
          text = block.titleData.text;
        } else if (block.textData?.text?.toLowerCase().includes(termLower)) {
          text = block.textData.text;
        } else if (
          block.messageBoxData?.text?.toLowerCase().includes(termLower)
        ) {
          text = block.messageBoxData.text;
        } else if (
          block.listData?.items?.some((li) =>
            li.toLowerCase().includes(termLower),
          )
        ) {
          text = block.listData.items.join(" ");
        } else if (block.codeData?.content?.toLowerCase().includes(termLower)) {
          text = block.codeData.content;
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
