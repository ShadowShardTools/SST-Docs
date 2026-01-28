import { describe, it, expect } from "vitest";
import { filterTree } from "../filterTree";
import type { Category } from "@shadow-shard-tools/docs-core";

describe("filterTree", () => {
  const mockTree: Category[] = [
    {
      id: "cat1",
      title: "Products",
      docs: [
        { id: "p1", title: "Product One", description: "", content: [] },
        { id: "p2", title: "Services", description: "", content: [] },
      ],
      children: [
        {
          id: "sub1",
          title: "Sub Item",
          docs: [],
          children: [],
        },
      ],
    },
  ];

  it("should filter top level categories", () => {
    const filtered = filterTree(mockTree, "Nothing");
    expect(filtered).toHaveLength(0);
  });

  it("should keep category if title matches and remove non-matching docs", () => {
    const filtered = filterTree(mockTree, "Product");
    expect(filtered).toHaveLength(1);
    expect(filtered[0].docs).toHaveLength(1);
    expect(filtered[0].docs![0].id).toBe("p1");
  });

  it("should keep category if nested docs match", () => {
    const filtered = filterTree(mockTree, "Services");
    expect(filtered).toHaveLength(1);
    expect(filtered[0].docs).toHaveLength(1);
    expect(filtered[0].docs![0].id).toBe("p2");
  });

  it("should keep children if they match", () => {
    const filtered = filterTree(mockTree, "Sub");
    expect(filtered).toHaveLength(1);
    expect(filtered[0].children).toHaveLength(1);
    expect(filtered[0].children![0].id).toBe("sub1");
  });
});
