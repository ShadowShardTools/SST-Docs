import { describe, it, expect } from "vitest";
import { searchInDocItem } from "../searchInDocItem";
import type { DocItem } from "@shadow-shard-tools/docs-core";

describe("searchInDocItem", () => {
  const baseDoc: DocItem = {
    id: "doc1",
    title: "Advanced Guide",
    description: "",
    content: [],
    tags: ["react", "typescript"],
  };

  it("should match title", () => {
    expect(searchInDocItem(baseDoc, "advanced")).toBe(true);
    expect(searchInDocItem(baseDoc, "guide")).toBe(true);
    expect(searchInDocItem(baseDoc, "missing")).toBe(false);
  });

  it("should match tags", () => {
    expect(searchInDocItem(baseDoc, "react")).toBe(true);
    expect(searchInDocItem(baseDoc, "typescript")).toBe(true);
  });

  it("should match text content blocks", () => {
    const docWithText: DocItem = {
      ...baseDoc,
      content: [{ type: "text", textData: { text: "Hello world" } }],
    };
    expect(searchInDocItem(docWithText, "world")).toBe(true);
  });

  it("should match code content blocks", () => {
    const docWithCode: DocItem = {
      ...baseDoc,
      content: [
        {
          type: "code",
          codeData: { content: 'console.log("hello")', name: "setup.js" },
        },
      ],
    };
    expect(searchInDocItem(docWithCode, "console")).toBe(true);
    expect(searchInDocItem(docWithCode, "setup")).toBe(true);
  });

  it("should ignore HTML tags during normalization", () => {
    const docWithHtml: DocItem = {
      ...baseDoc,
      title: "<b>Title</b>",
    };
    expect(searchInDocItem(docWithHtml, "title")).toBe(true);
  });
});
