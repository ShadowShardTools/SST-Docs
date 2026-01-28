import { describe, it, expect } from "vitest";
import {
  findCategoryTrail,
  findCategoryNode,
  findDocTrail,
  collectCategoryIds,
  collectCategoryTitles,
  collectDocTitles,
} from "../editorTree";

const mockTree = [
  {
    id: "cat1",
    title: "Category 1",
    children: [
      { id: "cat1-1", title: "Sub Cat 1", children: [] },
      {
        id: "cat1-2",
        title: "Sub Cat 2",
        docs: [{ id: "doc1", title: "Doc 1", content: [] }],
      },
    ],
  },
  { id: "cat2", title: "Category 2", children: [] },
];

describe("editorTree Utilities", () => {
  describe("findCategoryTrail", () => {
    it("should find nested category path", () => {
      // @ts-ignore
      const trail = findCategoryTrail(mockTree, "cat1-1");
      expect(trail).toHaveLength(2);
      expect(trail?.[0].id).toBe("cat1");
      expect(trail?.[1].id).toBe("cat1-1");
    });

    it("should return null for missing category", () => {
      // @ts-ignore
      expect(findCategoryTrail(mockTree, "missing")).toBeNull();
    });
  });

  describe("findCategoryNode", () => {
    it("should return the node itself", () => {
      // @ts-ignore
      const node = findCategoryNode(mockTree, "cat1-2");
      expect(node?.id).toBe("cat1-2");
    });
  });

  describe("findDocTrail", () => {
    it("should find path to document", () => {
      // @ts-ignore
      const result = findDocTrail(mockTree, "doc1");
      expect(result).not.toBeNull();
      expect(result?.categories).toHaveLength(2);
      expect(result?.doc.id).toBe("doc1");
    });

    it("should return null for missing doc", () => {
      // @ts-ignore
      expect(findDocTrail(mockTree, "missing")).toBeNull();
    });
  });

  describe("collect helpers", () => {
    it("should collect ids", () => {
      // @ts-ignore
      const ids = collectCategoryIds(mockTree);
      expect(ids.has("cat1")).toBe(true);
      expect(ids.has("cat1-1")).toBe(true);
    });

    it("should collect titles", () => {
      // @ts-ignore
      const titles = collectCategoryTitles(mockTree);
      expect(titles.has("Category 1")).toBe(true);
    });

    it("should collect doc titles", () => {
      const docs = [
        { id: "1", title: "D1" },
        { id: "2", title: "D2" },
      ];
      // @ts-ignore
      const titles = collectDocTitles(docs);
      expect(titles).toContain("D1");
      expect(titles).toContain("D2");
    });
  });
});
