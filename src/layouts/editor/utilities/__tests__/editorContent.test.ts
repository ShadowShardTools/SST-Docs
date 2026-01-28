import { describe, it, expect } from "vitest";
import { safeParseJson, sanitizeContentBlocks } from "../editorContent";

describe("editorContent Utilities", () => {
  describe("safeParseJson", () => {
    it("should parse valid JSON", () => {
      expect(safeParseJson('{"a":1}')).toEqual({ a: 1 });
    });

    it("should return null for invalid JSON", () => {
      expect(safeParseJson("{invalid}")).toBeNull();
    });
  });

  describe("sanitizeContentBlocks", () => {
    it("should sanitize text blocks", () => {
      const blocks = [
        { type: "text", textData: { text: "<script>alert(1)</script>Hello" } },
      ];
      const result = sanitizeContentBlocks(blocks as any[]);
      expect((result[0] as any).textData.text).not.toContain("<script>");
      expect((result[0] as any).textData.text).toContain("Hello");
    });

    it("should pass through unknown blocks", () => {
      const blocks = [{ type: "unknown", data: "test" }];
      // @ts-ignore
      const result = sanitizeContentBlocks(blocks);
      expect(result).toEqual(blocks);
    });
  });
});
