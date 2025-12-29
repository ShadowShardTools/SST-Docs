import type {
  Category,
  CodeData,
  DocItem,
  TableData,
} from "@shadow-shard-tools/docs-core";
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

type ContentMatch = { snippet: string; score: number; blockIndex?: number };

const codeMatchSnippet = (
  codeData: CodeData | null | undefined,
  lower: string,
  blockIndex: number,
): ContentMatch | null => {
  if (!codeData) return null;

  if (codeData.content?.toLowerCase().includes(lower)) {
    return {
      snippet: sliceSnippet(codeData.content, lower),
      score: 62,
      blockIndex,
    };
  }

  if (codeData.sections?.length) {
    for (const section of codeData.sections) {
      if (section.content.toLowerCase().includes(lower)) {
        return {
          snippet: sliceSnippet(section.content, lower),
          score: 62,
          blockIndex,
        };
      }

      if (section.filename?.toLowerCase().includes(lower)) {
        return {
          snippet: sliceSnippet(section.filename, lower),
          score: 60,
          blockIndex,
        };
      }

      if (section.language?.toLowerCase().includes(lower)) {
        return {
          snippet: section.language ?? "",
          score: 58,
          blockIndex,
        };
      }
    }
  }

  if (codeData.name?.toLowerCase().includes(lower)) {
    return {
      snippet: sliceSnippet(codeData.name, lower),
      score: 60,
      blockIndex,
    };
  }

  if (codeData.language?.toLowerCase().includes(lower)) {
    return {
      snippet: codeData.language,
      score: 58,
      blockIndex,
    };
  }

  return null;
};

const tableMatchSnippet = (
  tableData: TableData | undefined,
  lower: string,
  blockIndex: number,
): ContentMatch | null => {
  if (!tableData?.data?.length) return null;

  for (const row of tableData.data) {
    for (const cell of row) {
      if (cell.content.toLowerCase().includes(lower)) {
        return {
          snippet: sliceSnippet(cell.content, lower),
          score: 78,
          blockIndex,
        };
      }
    }
  }

  return null;
};

const contentMatchSnippet = (
  item: DocItem | Category,
  lower: string,
): ContentMatch | null => {
  if (!item.content) return null;

  for (let i = 0; i < item.content.length; i += 1) {
    const block = item.content[i];

    switch (block.type) {
      case "title":
        if (block.titleData.text?.toLowerCase().includes(lower)) {
          return {
            snippet: sliceSnippet(block.titleData.text, lower),
            score: 90,
            blockIndex: i,
          };
        }
        break;
      case "text":
        if (block.textData.text?.toLowerCase().includes(lower)) {
          return {
            snippet: sliceSnippet(block.textData.text, lower),
            score: 80,
            blockIndex: i,
          };
        }
        break;
      case "messageBox":
        if (block.messageBoxData.text?.toLowerCase().includes(lower)) {
          return {
            snippet: sliceSnippet(block.messageBoxData.text, lower),
            score: 72,
            blockIndex: i,
          };
        }
        break;
      case "list": {
        const matchedItem = block.listData.items?.find((li) =>
          li.toLowerCase().includes(lower),
        );
        if (matchedItem) {
          return {
            snippet: sliceSnippet(matchedItem, lower),
            score: 68,
            blockIndex: i,
          };
        }
        break;
      }
      case "code": {
        const match = codeMatchSnippet(block.codeData, lower, i);
        if (match) return match;
        break;
      }
      case "table": {
        const match = tableMatchSnippet(block.tableData, lower, i);
        if (match) return match;
        break;
      }
      default:
        break;
    }
  }

  return null;
};

const DOC_BOOST = 3;
const CATEGORY_PENALTY = -3;

export const processSearchResults = (
  results: Array<DocItem | Category>,
  searchTerm: string,
): SearchMatch[] => {
  if (!searchTerm.trim()) return [];

  const termLower = searchTerm.toLowerCase();

  const filtered = results.filter((item) =>
    itemMatchesSearchTerm(item, termLower),
  );

  const scored = filtered.map((item, index) => {
    const typeBoost = isCategoryItem(item) ? CATEGORY_PENALTY : DOC_BOOST;

    if (item.title.toLowerCase().includes(termLower)) {
      return {
        item,
        snippet: item.title,
        score: 120 + typeBoost,
        index,
      };
    }

    if (
      isCategoryItem(item) &&
      item.description?.toLowerCase().includes(termLower)
    ) {
      return {
        item,
        snippet: sliceSnippet(item.description, termLower),
        score: 98 + typeBoost,
        index,
      };
    }

    const contentSnippet = contentMatchSnippet(item, termLower);
    if (contentSnippet) {
      return {
        item,
        snippet: contentSnippet.snippet,
        blockIndex: contentSnippet.blockIndex,
        score: contentSnippet.score + typeBoost,
        index,
      };
    }

    if (!isCategoryItem(item) && item.tags?.length) {
      const tag = item.tags.find((t) => t.toLowerCase().includes(termLower));
      if (tag) {
        return {
          item,
          snippet: `Tag: ${tag}`,
          score: 55 + typeBoost,
          index,
        };
      }
    }

    // Fallback to title to avoid duplicates with empty snippet
    return {
      item,
      snippet: item.title,
      score: 30 + typeBoost,
      index,
    };
  });

  return scored
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(({ index: _index, ...rest }) => rest);
};
