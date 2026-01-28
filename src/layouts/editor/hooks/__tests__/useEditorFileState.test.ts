import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useEditorFileState } from "../useEditorFileState";

describe("useEditorFileState", () => {
  const mockRead = vi.fn();
  const mockWrite = vi.fn();
  const mockReload = vi.fn();

  const defaultProps = {
    defaultFilePath: null as string | null,
    selectedContent: null,
    productVersioning: false,
    currentProduct: "",
    currentVersion: "",
    read: mockRead,
    write: mockWrite,
    reload: mockReload,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with default state", () => {
    const { result } = renderHook(() => useEditorFileState(defaultProps));
    expect(result.current.fileStatus).toBe("idle");
    expect(result.current.currentFilePath).toBeNull();
  });

  it("should load file when path changes", async () => {
    mockRead.mockResolvedValue({
      content: '{"content": []}',
      encoding: "utf8",
    });

    const { result, rerender } = renderHook(
      (props) => useEditorFileState(props),
      {
        initialProps: defaultProps,
      },
    );

    // Update prop
    rerender({ ...defaultProps, defaultFilePath: "test.json" });

    expect(result.current.currentFilePath).toBe("test.json");

    // Wait for load
    await waitFor(() => expect(result.current.fileStatus).toBe("idle"));
    expect(mockRead).toHaveBeenCalledWith("test.json");
  });

  it("should handle save", async () => {
    mockRead.mockResolvedValue({
      content: '{"content": []}',
      encoding: "utf8",
    });
    mockWrite.mockResolvedValue({ ok: true, path: "test.json" });
    mockReload.mockResolvedValue(true);

    const { result } = renderHook((props) => useEditorFileState(props), {
      initialProps: { ...defaultProps, defaultFilePath: "test.json" },
    });

    await waitFor(() => expect(result.current.fileStatus).toBe("idle"));

    await act(async () => {
      await result.current.handleSave();
    });

    expect(mockWrite).toHaveBeenCalled();
    expect(result.current.showSavedIndicator).toBe(true);
  });

  it("should fail save on invalid JSON", async () => {
    mockRead.mockResolvedValue({
      content: "{ invalid json }",
      encoding: "utf8",
    });

    const { result } = renderHook((props) => useEditorFileState(props), {
      initialProps: { ...defaultProps, defaultFilePath: "bad.json" },
    });

    await waitFor(() => expect(result.current.fileStatus).toBe("idle")); // Loaded the "bad" text file fine

    await act(async () => {
      await result.current.handleSave();
    });

    expect(result.current.fileStatus).toBe("error");
    expect(result.current.fileError).toContain("Invalid JSON");
  });

  it("should save backup when enabled", async () => {
    const validJson = JSON.stringify({ content: [] });
    mockRead.mockResolvedValue({ content: validJson, encoding: "utf8" });
    mockWrite.mockResolvedValue({ ok: true, path: "test.json" });
    mockReload.mockResolvedValue(true);

    const { result } = renderHook((props) => useEditorFileState(props), {
      initialProps: { ...defaultProps, defaultFilePath: "test.json" },
    });

    await waitFor(() => expect(result.current.fileStatus).toBe("idle"));

    // Enable backup
    act(() => {
      result.current.setBackupOnSave(true);
    });

    await act(async () => {
      await result.current.handleSave();
    });

    // Should write backup then file
    expect(mockWrite).toHaveBeenCalledWith("test.json.bak", validJson, "utf8");
    expect(mockWrite).toHaveBeenCalledWith(
      "test.json",
      expect.any(String),
      "utf8",
    );
  });
});
