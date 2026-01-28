import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useEditorData } from "../useEditorData";
import { useVersionedDocumentationLoader } from "../../../../services/useVersionedDocumentationLoader";
import * as client from "../../api/client";

// Mock dependencies
vi.mock("../../../../services/useVersionedDocumentationLoader", () => ({
  useVersionedDocumentationLoader: vi.fn(),
}));

vi.mock("../../api/client", () => ({
  ping: vi.fn(),
}));

vi.mock("../../../../application/config/clientConfig", () => ({
  clientConfig: { PRODUCT_VERSIONING: false },
}));

const mockLoader = useVersionedDocumentationLoader as any;
const mockPing = client.ping as any;

describe("useEditorData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default loader mock
    mockLoader.mockReturnValue({
      products: [],
      versions: [],
      items: [],
      tree: [],
      status: "idle",
      error: null,
      reload: vi.fn(),
      setCurrentProduct: vi.fn(),
      setCurrentVersion: vi.fn(),
    });
    // Default ping mock
    mockPing.mockResolvedValue({ dataRoot: "/data" });
  });

  it("should initialize and ping", async () => {
    const { result } = renderHook(() => useEditorData());

    // Should call ping
    expect(mockPing).toHaveBeenCalled();

    // Should eventually have lastPing data
    await waitFor(() =>
      expect(result.current.lastPing).toEqual({ dataRoot: "/data" }),
    );
  });

  it("should handle ping error", async () => {
    mockPing.mockRejectedValue(new Error("Ping failed"));
    const { result } = renderHook(() => useEditorData());

    await waitFor(() =>
      expect(result.current.error).toContain("Editor API unavailable"),
    );
  });

  it("should delegate to loader", () => {
    mockLoader.mockReturnValue({
      status: "loading",
      items: [],
      tree: [],
    });

    const { result } = renderHook(() => useEditorData());
    expect(result.current.status).toBe("loading");
  });
});
