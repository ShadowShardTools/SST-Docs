import { describe, it, expect } from "vitest";
import { processSearchResults } from "../processSearchResults";
import type { DocItem } from "@shadow-shard-tools/docs-core";

describe("processSearchResults", () => {
  const mockDoc: DocItem = {
    id: "doc1",
    title: "Alpha Guide",
    description: "",
    content: [{ type: "text", textData: { text: "Some content here" } }],
    tags: ["first"],
  };

  const mockDoc2: DocItem = {
    id: "doc2",
    title: "Beta Manual",
    description: "Detailed Beta instructions",
    content: [],
    tags: [],
  };

  const results = [mockDoc, mockDoc2];

  it("should return empty array for empty search term", () => {
    expect(processSearchResults(results, "")).toEqual([]);
  });

  it("should rank title matches higher than content matches", () => {
    const searchResults = processSearchResults(results, "Alpha");
    expect(searchResults).toHaveLength(1);
    expect(searchResults[0].item.id).toBe("doc1");
    expect(searchResults[0].score).toBeGreaterThan(100);
  });

  it("should find content matches and provide snippets", () => {
    const searchResults = processSearchResults(results, "content");
    expect(searchResults).toHaveLength(1);
    expect(searchResults[0].snippet).toContain("content");
    expect(searchResults[0].score).toBeGreaterThan(50);
    expect(searchResults[0].score).toBeLessThan(100);
  });

  it("should sort results by score descending", () => {
    // Both match 'Alpha' in title, but let's test a case where one matches title and one matches content
    const items = [
      { id: "1", title: "Test doc", content: [] },
      {
        id: "2",
        title: "Other doc",
        content: [{ type: "text", textData: { text: "test content" } }],
      },
    ] as any;

    const sorted = processSearchResults(items, "Test");
    expect(sorted[0].item.id).toBe("1"); // Title match
    expect(sorted[1].item.id).toBe("2"); // Content match
  });
});
