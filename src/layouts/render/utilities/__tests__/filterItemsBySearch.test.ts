import { describe, it, expect, vi, beforeEach } from "vitest";
import { filterItemsBySearch } from "../filterItemsBySearch";
import searchInDocItem from "../searchInDocItem";

vi.mock("../searchInDocItem", () => {
  const mock = vi.fn();
  return {
    default: mock,
    searchInDocItem: mock,
  };
});

describe("filterItemsBySearch", () => {
  const mockItems = [{ id: "doc1" }] as any;
  const mockStandalone = [{ id: "sdoc1" }] as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return empty array if search term is empty", () => {
    const result = filterItemsBySearch(mockItems, mockStandalone, "  ");
    expect(result).toEqual([]);
  });

  it("should return matching items", () => {
    vi.mocked(searchInDocItem).mockImplementation(
      (item: any) => item.id === "doc1",
    );

    const result = filterItemsBySearch(mockItems, mockStandalone, "test");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("doc1");
  });

  it("should include standalone docs in search", () => {
    vi.mocked(searchInDocItem).mockImplementation(
      (item: any) => item.id === "sdoc1",
    );

    const result = filterItemsBySearch(mockItems, mockStandalone, "test");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("sdoc1");
  });
});
