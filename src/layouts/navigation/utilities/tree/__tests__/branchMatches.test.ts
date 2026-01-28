import { describe, it, expect } from "vitest";
import { branchMatches } from "../branchMatches";
import type { Category, DocItem } from "@shadow-shard-tools/docs-core";

describe("branchMatches", () => {
  const mockDoc: DocItem = {
    id: "doc1",
    title: "Find Me",
    description: "",
    content: [],
  };
  const mockChildDoc: DocItem = {
    id: "doc2",
    title: "Sub Doc",
    description: "",
    content: [],
  };

  const mockTree: Category = {
    id: "cat1",
    title: "Top Category",
    docs: [mockDoc],
    children: [
      {
        id: "subcat1",
        title: "Middle Category",
        docs: [mockChildDoc],
        children: [],
      },
    ],
  };

  it("should match if category title matches", () => {
    expect(branchMatches(mockTree, "top")).toBe(true);
  });

  it("should match if any doc in category matches", () => {
    expect(branchMatches(mockTree, "find")).toBe(true);
  });

  it("should match if any child category matches", () => {
    expect(branchMatches(mockTree, "middle")).toBe(true);
  });

  it("should match if any doc in child category matches", () => {
    expect(branchMatches(mockTree, "sub")).toBe(true);
  });

  it("should return false if no matches found", () => {
    expect(branchMatches(mockTree, "nothing")).toBe(false);
  });
});
