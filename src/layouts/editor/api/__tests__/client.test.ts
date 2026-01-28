import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as client from "../client";

// Mock fetch
const globalFetch = global.fetch;
const fetchMock = vi.fn();

describe("Editor API Client", () => {
  beforeEach(() => {
    global.fetch = fetchMock;
    fetchMock.mockClear();
  });

  afterEach(() => {
    global.fetch = globalFetch;
  });

  it("should ping successfully", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true, mode: "test", dataRoot: "/data" }),
    });

    const res = await client.ping();
    expect(fetchMock).toHaveBeenCalledWith("/__editor/api/ping", undefined);
    expect(res).toEqual({ ok: true, mode: "test", dataRoot: "/data" });
  });

  it("should list directory", async () => {
    const mockEntries = [
      { name: "file.txt", isDirectory: false, size: 100, mtime: 0 },
    ];
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ dir: ".", entries: mockEntries }),
    });

    const res = await client.list();
    // Check if URL contains query params
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/__editor/api/list"),
      undefined,
    );
    expect(res.entries).toEqual(mockEntries);
  });

  it("should read file", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ path: "foo.json", encoding: "utf8", content: "{}" }),
    });

    const res = await client.read("foo.json");
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("path=foo.json"),
      undefined,
    );
    expect(res.content).toBe("{}");
  });

  it("should write file", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true, path: "foo.json" }),
    });

    await client.write("foo.json", "{}");
    expect(fetchMock).toHaveBeenCalledWith(
      "/__editor/api/write",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          path: "foo.json",
          content: "{}",
          encoding: "utf8",
        }),
      }),
    );
  });

  it("should handle errors", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      json: async () => ({ error: "Custom error message" }),
    });

    await expect(client.read("bad.file")).rejects.toThrow(
      "Custom error message",
    );
  });

  it("should handle network errors (json parse fail)", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 404,
      statusText: "Not Found",
      json: async () => {
        throw new Error("Invalid JSON");
      },
    });

    await expect(client.read("missing")).rejects.toThrow("Not Found");
  });

  it("should remove file", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    });

    await client.remove("file.txt");
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/__editor/api/delete?path=file.txt"),
      expect.objectContaining({ method: "DELETE" }),
    );
  });

  it("should upload file", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true, path: "file.txt", size: 10 }),
    });

    const blob = new Blob(["content"]);
    await client.upload("file.txt", blob);

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/__editor/api/upload?path=file.txt"),
      expect.objectContaining({
        method: "POST",
        body: blob,
      }),
    );
  });

  it("should run generator", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true, script: "gen" }),
    });

    await client.runGenerator("gen");
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/__editor/api/run-generator"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ script: "gen" }),
      }),
    );
  });

  it("should manage products", async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });

    await client.createProduct("p1", "Product 1");
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/product"),
      expect.objectContaining({ method: "POST" }),
    );

    await client.updateProduct("p1", "New Label");
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/product"),
      expect.objectContaining({ method: "PUT" }),
    );

    await client.deleteProduct("p1");
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/product?product=p1"),
      expect.objectContaining({ method: "DELETE" }),
    );
  });

  it("should manage versions", async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });

    await client.createVersion("p1", "v1", "Version 1");
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/version"),
      expect.objectContaining({ method: "POST" }),
    );

    await client.updateVersion("p1", "v1", "New Label");
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/version"),
      expect.objectContaining({ method: "PUT" }),
    );

    await client.deleteVersion("p1", "v1");
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/version?product=p1&version=v1"),
      expect.objectContaining({ method: "DELETE" }),
    );
  });
});
