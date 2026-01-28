import { describe, it, expect } from "vitest";
import { findPath } from "../findPath";
import type { Category } from "@shadow-shard-tools/docs-core";

describe("findPath", () => {
  const mockTree: Category[] = [
    {
      id: "cat1",
      title: "Top",
      docs: [],
      children: [
        {
          id: "sub1",
          title: "Middle",
          docs: [{ id: "doc1", title: "Target", description: "", content: [] }],
          children: [
            {
              id: "leaf1",
              title: "Bottom",
              docs: [
                {
                  id: "doc2",
                  title: "Deep Target",
                  description: "",
                  content: [],
                },
              ],
              children: [],
            },
          ],
        },
      ],
    },
  ];

  it("should return empty array if doc not found", () => {
    expect(findPath(mockTree, "missing")).toEqual([]);
  });

  it("should return full path to doc", () => {
    expect(findPath(mockTree, "doc1")).toEqual(["Top", "Middle"]);
  });

  it("should return full path to deep doc", () => {
    expect(findPath(mockTree, "doc2")).toEqual(["Top", "Middle", "Bottom"]);
  });
});
