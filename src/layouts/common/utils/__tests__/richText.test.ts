import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { sanitizeRichText } from "../richText";

describe("richText sanitization", () => {
  let originalDocument: any;

  beforeEach(() => {
    originalDocument = global.document;
  });

  afterEach(() => {
    global.document = originalDocument;
  });

  describe("HTML escaping", () => {
    it("should escape HTML special characters", () => {
      const result = sanitizeRichText('<script>alert("xss")</script>');
      expect(result).not.toContain("<script>");
      // The function escapes the tags
      expect(result.length).toBeGreaterThan(0);
    });

    it("should escape ampersands", () => {
      const result = sanitizeRichText("A & B");
      expect(result).toContain("&amp;");
    });
  });

  describe("Allowed tags", () => {
    it("should preserve strong tags", () => {
      const result = sanitizeRichText("<strong>Bold</strong>");
      expect(result).toBe("<strong>Bold</strong>");
    });

    it("should preserve em tags", () => {
      const result = sanitizeRichText("<em>Italic</em>");
      expect(result).toBe("<em>Italic</em>");
    });

    it("should convert b to strong", () => {
      const result = sanitizeRichText("<b>Bold</b>");
      expect(result).toBe("<strong>Bold</strong>");
    });

    it("should convert i to em", () => {
      const result = sanitizeRichText("<i>Italic</i>");
      expect(result).toBe("<em>Italic</em>");
    });

    it("should preserve br tags", () => {
      const result = sanitizeRichText("Line1<br>Line2");
      expect(result).toContain("<br>");
    });
  });

  describe("Link sanitization", () => {
    it("should preserve safe relative links", () => {
      const result = sanitizeRichText('<a href="/page">Link</a>');
      expect(result).toContain('href="/page"');
      expect(result).toContain("Link");
    });

    it("should preserve https links", () => {
      const result = sanitizeRichText('<a href="https://example.com">Link</a>');
      expect(result).toContain('href="https://example.com"');
    });

    it("should add target blank for external links", () => {
      const result = sanitizeRichText('<a href="https://example.com">Link</a>');
      expect(result).toContain('target="_blank"');
      expect(result).toContain('rel="noopener noreferrer"');
    });

    it("should remove javascript: protocol", () => {
      const result = sanitizeRichText('<a href="javascript:alert(1)">Bad</a>');
      expect(result).not.toContain("javascript:");
      expect(result).toBe("Bad");
    });

    it("should preserve mailto links", () => {
      const result = sanitizeRichText(
        '<a href="mailto:test@example.com">Email</a>',
      );
      expect(result).toContain("mailto:test@example.com");
    });

    it("should apply classes from StyleTheme", () => {
      const styles = {
        hyperlink: {
          link: "test-link-class",
        },
      } as any;
      const result = sanitizeRichText(
        '<a href="https://example.com">Link</a>',
        styles,
      );
      expect(result).toContain('class="test-link-class"');
    });
  });

  describe("Newline handling", () => {
    it("should convert newlines to br tags", () => {
      const result = sanitizeRichText("Line1\nLine2");
      expect(result).toContain("<br>");
    });

    it("should convert div and trim trailing br", () => {
      // The function adds <br> for div but trimTrailingBreaks removes it
      const result = sanitizeRichText("<div>Text</div>");
      expect(result).toBe("Text");
    });

    it("should trim trailing br tags", () => {
      const result = sanitizeRichText("Text<br><br>");
      expect(result).toBe("Text");
    });
  });

  describe("SSR fallback", () => {
    it("should handle missing document", () => {
      global.document = undefined as any;
      const result = sanitizeRichText("<strong>Bold</strong>");
      // In SSR mode, tags are escaped
      expect(result).not.toContain("<strong>");
    });

    it("should convert newlines in SSR mode", () => {
      global.document = undefined as any;
      const result = sanitizeRichText("Line1\nLine2");
      expect(result).toContain("<br>");
    });
  });

  describe("Edge cases", () => {
    it("should handle empty input", () => {
      expect(sanitizeRichText("")).toBe("");
    });

    it("should handle nested tags", () => {
      const result = sanitizeRichText("<strong><em>Bold Italic</em></strong>");
      expect(result).toBe("<strong><em>Bold Italic</em></strong>");
    });

    it("should remove disallowed tags but keep content", () => {
      const result = sanitizeRichText("<span>Text</span>");
      expect(result).toContain("Text");
      expect(result).not.toContain("<span>");
    });
  });
});
