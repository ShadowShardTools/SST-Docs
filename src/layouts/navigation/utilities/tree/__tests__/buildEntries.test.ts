import { describe, it, expect } from "vitest";
import { buildEntries } from "../buildEntries";
import type { Category, DocItem } from "@shadow-shard-tools/docs-core";

describe("buildEntries", () => {
  const mockDoc: DocItem = {
    id: "doc1",
    title: "Document 1",
    description: "",
    content: [],
  };
  const mockStandaloneDoc: DocItem = {
    id: "sdoc1",
    title: "Standalone 1",
    description: "",
    content: [],
  };

  const mockTree: Category[] = [
    {
      id: "cat1",
      title: "Category 1",
      docs: [mockDoc],
      children: [
        {
          id: "subcat1",
          title: "Subcategory 1",
          docs: [],
          children: [],
        },
      ],
    },
  ];

  it("should include standalone docs at depth 0", () => {
    const entries = buildEntries([], [mockStandaloneDoc], {}, "");
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({
      type: "doc",
      id: "sdoc1",
      depth: 0,
      key: "doc-sdoc1",
    });
  });

  it("should include categories at depth 0", () => {
    const entries = buildEntries(mockTree, [], {}, "");
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({
      type: "category",
      id: "cat1",
      depth: 0,
      key: "cat-cat1",
    });
  });

  it("should include nested items when category is open", () => {
    const open = { cat1: true };
    const entries = buildEntries(mockTree, [], open, "");
    // Category 1, Doc 1, Subcategory 1
    expect(entries).toHaveLength(3);
    expect(entries[1]).toMatchObject({
      type: "doc",
      id: "doc1",
      depth: 1,
    });
    expect(entries[2]).toMatchObject({
      type: "category",
      id: "subcat1",
      depth: 1,
    });
  });

  it("should filter items based on title", () => {
    const entries = buildEntries([], [mockStandaloneDoc], {}, "Standalone");
    expect(entries).toHaveLength(1);

    const hiddenEntries = buildEntries([], [mockStandaloneDoc], {}, "hidden");
    expect(hiddenEntries).toHaveLength(0);
  });
});
