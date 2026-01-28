import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDocNavigation } from "../useDocNavigation";
import * as router from "react-router-dom";

vi.mock("react-router-dom", () => ({
  useNavigate: vi.fn(),
  useParams: vi.fn(),
  useLocation: vi.fn(),
}));

describe("useDocNavigation", () => {
  const mockNavigate = vi.fn();
  const mockItems = [{ id: "doc1", title: "Doc 1" }] as any;
  const mockStandalone = [{ id: "sdoc1", title: "Standalone 1" }] as any;
  const mockTree = [{ id: "cat1", children: [] }] as any;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(router.useNavigate).mockReturnValue(mockNavigate);
    vi.mocked(router.useLocation).mockReturnValue({ search: "" } as any);
    vi.mocked(router.useParams).mockReturnValue({});
  });

  it("should select item based on URL params", () => {
    vi.mocked(router.useParams).mockReturnValue({ docId: "doc1" });

    const { result } = renderHook(() =>
      useDocNavigation(mockItems, mockTree, mockStandalone),
    );

    expect(result.current.selectedItem?.id).toBe("doc1");
    expect(result.current.selectedCategory).toBeNull();
  });

  it("should fallback to first standalone doc if no ID provided", () => {
    vi.mocked(router.useParams).mockReturnValue({});

    renderHook(() => useDocNavigation(mockItems, mockTree, mockStandalone));

    expect(mockNavigate).toHaveBeenCalledWith(
      expect.objectContaining({ pathname: "/sdoc1" }),
      expect.anything(),
    );
  });

  it("should navigate to entry when requested", () => {
    const { result } = renderHook(() =>
      useDocNavigation(mockItems, mockTree, mockStandalone),
    );

    act(() => {
      result.current.navigateToEntry(mockItems[0]);
    });

    expect(mockNavigate).toHaveBeenCalledWith(
      expect.objectContaining({ pathname: "/doc1" }),
      expect.anything(),
    );
  });
});
