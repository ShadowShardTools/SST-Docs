import { describe, it, expect } from "vitest";
import { findCategoryById } from "../findCategoryById";
import type { Category } from "@shadow-shard-tools/docs-core";

describe("findCategoryById", () => {
  const mockTree: Category[] = [
    {
      id: "cat1",
      title: "Cat 1",
      docs: [],
      children: [
        {
          id: "sub1",
          title: "Sub 1",
          docs: [],
          children: [],
        },
      ],
    },
    {
      id: "cat2",
      title: "Cat 2",
      docs: [],
      children: [],
    },
  ];

  it("should return null if category not found", () => {
    expect(findCategoryById(mockTree, "missing")).toBeNull();
  });

  it("should find top level category", () => {
    const found = findCategoryById(mockTree, "cat1");
    expect(found).not.toBeNull();
    expect(found!.id).toBe("cat1");
  });

  it("should find nested category", () => {
    const found = findCategoryById(mockTree, "sub1");
    expect(found).not.toBeNull();
    expect(found!.id).toBe("sub1");
  });

  it("should find other top level category", () => {
    const found = findCategoryById(mockTree, "cat2");
    expect(found).not.toBeNull();
    expect(found!.id).toBe("cat2");
  });
});
