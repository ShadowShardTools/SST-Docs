import { describe, it, expect } from "vitest";
import { generateSnippet } from "../generateSnippet";
import type { DocItem } from "@shadow-shard-tools/docs-core";

describe("generateSnippet", () => {
  const mockDoc: DocItem = {
    id: "doc1",
    title: "Advanced React Guide",
    description: "",
    content: [
      {
        type: "text",
        textData: {
          text: "The concept of hooks was introduced in React 16.8 to allow state in functional components.",
        },
      },
    ],
    tags: ["react-hooks"],
  };

  it("should return title if it matches", () => {
    expect(generateSnippet(mockDoc, "Advanced")).toBe("Advanced React Guide");
  });

  it("should return a snippet of content with ellipsis", () => {
    const snippet = generateSnippet(mockDoc, "functional");
    expect(snippet).toContain("functional");
    expect(snippet).toContain("...");
  });

  it("should match tags if no title or content match", () => {
    expect(generateSnippet(mockDoc, "react-hooks")).toBe("Tag: react-hooks");
  });

  it("should return empty string if no match", () => {
    expect(generateSnippet(mockDoc, "vue")).toBe("");
  });

  it("should generate snippet from list content", () => {
    const listDoc: DocItem = {
      ...mockDoc,
      content: [
        { type: "list", listData: { items: ["Apple", "Banana", "Cherry"] } },
      ],
    };
    expect(generateSnippet(listDoc, "Banana")).toContain("Banana");
  });

  it("should generate snippet from messageBox", () => {
    const msgDoc: DocItem = {
      ...mockDoc,
      content: [
        {
          type: "messageBox",
          messageBoxData: { text: "Important: follow safe protocols" },
        },
      ],
    };
    expect(generateSnippet(msgDoc, "protocols")).toContain("protocols");
  });
});
