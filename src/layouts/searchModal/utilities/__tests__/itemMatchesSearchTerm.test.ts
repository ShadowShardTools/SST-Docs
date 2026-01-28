import { describe, it, expect } from "vitest";
import { itemMatchesSearchTerm } from "../itemMatchesSearchTerm";
import type { DocItem, Category } from "@shadow-shard-tools/docs-core";

describe("itemMatchesSearchTerm", () => {
  const mockDoc: DocItem = {
    id: "doc1",
    title: "Advanced React",
    description: "A deep dive into React",
    content: [
      { type: "text", textData: { text: "Hook patterns" } },
      {
        type: "code",
        codeData: { content: "useMemo(() => {}, [])", language: "typescript" },
      },
    ],
    tags: ["web", "frontend"],
  };

  const mockCategory: Category = {
    id: "cat1",
    title: "Frameworks",
    docs: [mockDoc],
    children: [],
  };

  it("should match title", () => {
    expect(itemMatchesSearchTerm(mockDoc, "react")).toBe(true);
  });

  it("should match description", () => {
    expect(itemMatchesSearchTerm(mockDoc, "deep dive")).toBe(true);
  });

  it("should match content text", () => {
    expect(itemMatchesSearchTerm(mockDoc, "Hook")).toBe(true);
  });

  it("should match code content", () => {
    expect(itemMatchesSearchTerm(mockDoc, "useMemo")).toBe(true);
  });

  it("should match tags", () => {
    expect(itemMatchesSearchTerm(mockDoc, "frontend")).toBe(true);
  });

  it("should match category title", () => {
    expect(itemMatchesSearchTerm(mockCategory, "frame")).toBe(true);
  });

  it("should return false if no match", () => {
    expect(itemMatchesSearchTerm(mockDoc, "vue")).toBe(false);
  });

  it("should match list content", () => {
    const listDoc: DocItem = {
      ...mockDoc,
      content: [{ type: "list", listData: { items: ["Item 1", "Item 2"] } }],
    };
    expect(itemMatchesSearchTerm(listDoc, "Item 2")).toBe(true);
  });

  it("should match table content", () => {
    const tableDoc: DocItem = {
      ...mockDoc,
      content: [
        {
          type: "table",
          tableData: {
            data: [[{ content: "Cell A" }, { content: "Cell B" }]],
          },
        },
      ],
    };
    expect(itemMatchesSearchTerm(tableDoc, "Cell B")).toBe(true);
  });
});
