import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSearchLogic } from "../useSearchLogic";
import * as searchUtils from "../../../searchModal/utilities/itemMatchesSearchTerm";

vi.mock("../../../searchModal/utilities/itemMatchesSearchTerm", () => ({
  itemMatchesSearchTerm: vi.fn(),
}));

describe("useSearchLogic", () => {
  const mockItems = [{ id: "doc1", title: "Doc 1" }] as any;
  const mockStandalone = [] as any;
  const mockTree = [] as any;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  it("should initialize with empty search term", () => {
    const { result } = renderHook(() =>
      useSearchLogic(mockItems, mockStandalone, mockTree),
    );
    expect(result.current.searchTerm).toBe("");
    expect(result.current.searchResults).toEqual([]);
  });

  it("should debounce search term updates", async () => {
    const { result } = renderHook(() =>
      useSearchLogic(mockItems, mockStandalone, mockTree),
    );

    act(() => {
      result.current.setSearchTerm("test");
    });

    expect(result.current.debouncedSearchTerm).toBe("");

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current.debouncedSearchTerm).toBe("test");
  });

  it("should filter items based on debounced term", async () => {
    vi.mocked(searchUtils.itemMatchesSearchTerm).mockReturnValue(true);

    const { result } = renderHook(() =>
      useSearchLogic(mockItems, mockStandalone, mockTree),
    );

    act(() => {
      result.current.setSearchTerm("test");
    });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current.searchResults).toHaveLength(1);
    expect(result.current.searchResults[0].id).toBe("doc1");
  });

  it("should reset search", () => {
    const { result } = renderHook(() =>
      useSearchLogic(mockItems, mockStandalone, mockTree),
    );

    act(() => {
      result.current.setSearchTerm("test");
      vi.advanceTimersByTime(200);
    });

    expect(result.current.searchTerm).toBe("test");

    act(() => {
      result.current.resetSearch();
    });

    expect(result.current.searchTerm).toBe("");
    expect(result.current.searchResults).toEqual([]);
  });
});
