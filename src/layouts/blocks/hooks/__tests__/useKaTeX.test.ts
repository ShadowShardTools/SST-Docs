import { describe, it, expect, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useKaTeX } from "../useKaTeX";

// Mock katex module
vi.mock("katex", () => ({
  default: {
    renderToString: vi.fn((expr: string) => {
      if (expr.includes("invalid")) {
        throw new Error("Invalid LaTeX");
      }
      return `<span class="katex">${expr}</span>`;
    }),
  },
}));

describe("useKaTeX", () => {
  it("should handle empty expression immediately", () => {
    const { result } = renderHook(() => useKaTeX(""));

    // Empty expression should not load
    expect(result.current.html).toBe("");
    expect(result.current.isLoading).toBe(false);
  });

  it("should initialize with loading state for non-empty expression", () => {
    const { result } = renderHook(() => useKaTeX("E = mc^2"));

    // Should start loading
    expect(result.current.isLoading).toBe(true);
  });

  it("should eventually load KaTeX and render", async () => {
    const { result } = renderHook(() => useKaTeX("a + b"));

    await waitFor(
      () => {
        expect(result.current.isLoading).toBe(false);
      },
      { timeout: 2000 },
    );

    expect(result.current.html).toContain("katex");
    expect(result.current.error).toBeNull();
  });
});
