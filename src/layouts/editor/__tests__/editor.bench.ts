import { bench, describe, vi } from "vitest";
import * as client from "../api/client";
import {
  safeParseJson,
  sanitizeContentBlocks,
} from "../utilities/editorContent";
import { findCategoryTrail, collectCategoryIds } from "../utilities/editorTree";

// Mock dependencies
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock large directory list
const generateLargeDir = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    name: `file-${i}.json`,
    isDirectory: false,
    size: 1024,
    mtime: Date.now(),
  }));
};

// Generate deep tree
const generateDeepTree = (
  depth: number,
  width: number,
  prefix = "cat",
): any[] => {
  if (depth === 0) return [];
  return Array.from({ length: width }, (_, i) => ({
    id: `${prefix}-${depth}-${i}`,
    title: `Category ${depth}-${i}`,
    children: generateDeepTree(depth - 1, width, `${prefix}-${depth}-${i}`),
  }));
};

// Depth 6, width 4 ~ 5k nodes. Depth 10/3 is large. Let's use 8/3 ~ 9k nodes
const deepTree = generateDeepTree(8, 3);

describe("Editor Performance", () => {
  bench(
    "API list parsing (10k items)",
    async () => {
      const largeList = generateLargeDir(10000);
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ dir: ".", entries: largeList }),
      });
      await client.list();
    },
    { time: 500 },
  );

  bench(
    "JSON Safe Parse (Large Content)",
    () => {
      const largeJson = JSON.stringify({
        content: Array.from({ length: 1000 }, (_, i) => ({
          type: "paragraph",
          text: `This is paragraph ${i} with some content to make it larger.`,
        })),
      });
      safeParseJson(largeJson);
    },
    { time: 500 },
  );

  bench(
    "Content Sanitization (Deep Nested)",
    () => {
      const nestedList = {
        type: "list",
        listData: {
          // @ts-ignore
          items: Array.from(
            { length: 100 },
            () => "<script>alert(1)</script>Safe Text",
          ),
        },
      };
      const blocks = Array.from({ length: 50 }, () => nestedList);
      // @ts-ignore
      sanitizeContentBlocks(blocks);
    },
    { time: 500 },
  );

  bench(
    "Tree Traversal (Find via Recursion)",
    () => {
      // Search for a non-existent node to force full traversal or deep node
      // @ts-ignore
      findCategoryTrail(deepTree, "cat-1-0-1-0-1-0-1-0");
    },
    { time: 500 },
  );

  bench(
    "Tree Collection (Collect All IDs)",
    () => {
      // @ts-ignore
      collectCategoryIds(deepTree);
    },
    { time: 500 },
  );
});
