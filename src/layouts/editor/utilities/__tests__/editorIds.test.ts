import { describe, it, expect } from "vitest";
import { generateId, nextIncrementTitle } from "../editorIds";

describe("editorIds Utilities", () => {
  describe("generateId", () => {
    it("should generate string with prefix", () => {
      const id = generateId("test_");
      expect(id).toMatch(/^test_/);
      expect(id.length).toBeGreaterThan(5);
    });

    it("should generate unique ids", () => {
      const id1 = generateId("p_");
      const id2 = generateId("p_");
      expect(id1).not.toBe(id2);
    });
  });

  describe("nextIncrementTitle", () => {
    it("should increment title if collision exists", () => {
      const existing = new Set(["My Page (1)"]);
      const result = nextIncrementTitle("My Page", existing);
      expect(result).toBe("My Page (2)");
    });

    it("should start at 1", () => {
      const existing = new Set(["My Page"]);
      const result = nextIncrementTitle("My Page", existing);
      expect(result).toBe("My Page (1)");
    });
  });
});
