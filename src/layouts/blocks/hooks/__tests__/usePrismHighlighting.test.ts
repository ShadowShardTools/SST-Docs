import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { usePrismHighlighting } from "../usePrismHighlighting";

// Mock Prism
const mockPrism = {
  highlight: vi.fn(
    (code: string) => `<span class="highlighted">${code}</span>`,
  ),
  languages: {
    javascript: {},
    plaintext: {},
  },
};

vi.mock("prismjs", () => ({
  default: mockPrism,
}));

vi.mock("prismjs/themes/prism-tomorrow.css", () => ({}));
vi.mock("prismjs/components/prism-markup.js", () => ({}));
vi.mock("prismjs/components/prism-clike.js", () => ({}));
vi.mock("prismjs/components/prism-javascript.js", () => ({}));
vi.mock("prismjs/components/prism-markup-templating.js", () => ({}));
vi.mock("../../generatedImports/prism-languages.generated", () => ({}));

describe("usePrismHighlighting", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with prismLoaded false", () => {
    const sections = [
      { language: "javascript" as const, content: "const x = 1;" },
    ];
    const { result } = renderHook(() => usePrismHighlighting(sections, true));

    expect(result.current.prismLoaded).toBe(false);
    expect(result.current.codeRefs.current).toBeInstanceOf(Map);
  });

  it("should load Prism asynchronously", async () => {
    const sections = [
      { language: "javascript" as const, content: "const x = 1;" },
    ];
    const { result } = renderHook(() => usePrismHighlighting(sections, true));

    await waitFor(
      () => {
        expect(result.current.prismLoaded).toBe(true);
      },
      { timeout: 3000 },
    );
  });

  it("should not highlight when not visible", async () => {
    const sections = [
      { language: "javascript" as const, content: "const x = 1;" },
    ];
    const { result } = renderHook(() => usePrismHighlighting(sections, false));

    await waitFor(() => {
      expect(result.current.prismLoaded).toBe(true);
    });

    // Wait a bit to ensure highlighting doesn't happen
    await new Promise((resolve) => setTimeout(resolve, 200));
    expect(mockPrism.highlight).not.toHaveBeenCalled();
  });

  it("should handle multiple sections", async () => {
    const sections = [
      { language: "javascript" as const, content: "const x = 1;" },
      { language: "javascript" as const, content: "const y = 2;" },
    ];
    const { result } = renderHook(() => usePrismHighlighting(sections, true));

    await waitFor(() => {
      expect(result.current.prismLoaded).toBe(true);
    });

    expect(result.current.codeRefs.current).toBeInstanceOf(Map);
  });
});
