import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { resolvePublicDataPath } from "@shadow-shard-tools/docs-core/configs/sstDocsConfigShared";
import { loadVersionDataFromProvider } from "@shadow-shard-tools/docs-core/data";
import * as client from "../../layouts/editor/api/client";

// Mock dependencies
vi.mock("@shadow-shard-tools/docs-core/configs/sstDocsConfigShared", () => ({
  resolvePublicDataPath: vi.fn(),
}));

vi.mock("../../application/config/clientConfig", () => ({
  clientConfig: {
    PRODUCT_VERSIONING: false,
  },
}));

vi.mock("../../layouts/editor/api/client", () => ({
  read: vi.fn(),
}));

// Consolidated mock for Docs-Core modules
vi.mock("@shadow-shard-tools/docs-core/data", () => {
  const mockStorage = {
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
    clear: vi.fn(),
  };
  return {
    loadVersionDataFromProvider: vi.fn(),
    CachedDataProvider: vi.fn().mockImplementation(function (p) {
      return p;
    }),
    IdbDataCacheStorage: vi.fn().mockImplementation(function () {
      return mockStorage;
    }),
    HttpDataProvider: vi.fn(),
  };
});

vi.mock("@shadow-shard-tools/docs-core/utilities", () => ({
  WorkerHandler: vi.fn().mockImplementation(function () {
    return {
      buildTree: vi.fn(),
      terminate: vi.fn(),
    };
  }),
}));

// Global stubs
vi.stubGlobal(
  "Worker",
  class {
    onmessage = null;
    postMessage = vi.fn();
    terminate = vi.fn();
    addEventListener = vi.fn();
    removeEventListener = vi.fn();
  },
);

vi.stubGlobal("import.meta", {
  env: {
    BASE_URL: "/docs/",
    MODE: "test",
  },
});

// Import the loader AFTER mocks are defined
import { documentationLoader } from "../documentationLoader";

describe("documentationLoader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (resolvePublicDataPath as any).mockReturnValue("/docs/data");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("loadVersionData (HTTP source)", () => {
    it("should load data successfully from HTTP via provider", async () => {
      const mockData = { product: "foo", version: "1.0", items: [] };
      (loadVersionDataFromProvider as any).mockResolvedValue(mockData);

      const result = await documentationLoader.loadVersionData({
        product: "foo",
        version: "1.0",
      });

      expect(loadVersionDataFromProvider).toHaveBeenCalledWith(
        expect.any(Object),
        "/docs/data",
        expect.objectContaining({
          product: "foo",
          version: "1.0",
          prefetch: true,
        }),
      );
      expect(result).toEqual(mockData);
    });

    it("should retry on failure and eventually succeed", async () => {
      const mockData = { product: "bar", items: [] };
      (loadVersionDataFromProvider as any)
        .mockRejectedValueOnce(new Error("Network error"))
        .mockResolvedValue(mockData);

      const result = await documentationLoader.loadVersionData({
        product: "bar",
      });
      expect(result).toEqual(mockData);
      expect(loadVersionDataFromProvider).toHaveBeenCalledTimes(2);
    });

    it("should throw after 3 failed attempts", async () => {
      (loadVersionDataFromProvider as any).mockRejectedValue(
        new Error("Persistent error"),
      );

      await expect(
        documentationLoader.loadVersionData({ product: "fail-prod" }),
      ).rejects.toThrow("Persistent error");

      expect(loadVersionDataFromProvider).toHaveBeenCalledTimes(3);
    });
  });

  describe("loadVersionData (Editor source)", () => {
    it("should load data from editor client", async () => {
      const mockData = { product: "editor-prod", items: [] };
      (client.read as any).mockResolvedValue({
        content: JSON.stringify(mockData),
        encoding: "utf8",
      });

      (loadVersionDataFromProvider as any).mockImplementation(
        async (
          provider: any,
          _base: string,
          _options: any,
          joinPath?: (b: string, c: string) => string,
        ) => {
          if (joinPath) {
            joinPath("base", "child");
            joinPath("", "child");
            joinPath("base", "");
          }
          await provider.readJson("versions.json");
          return mockData;
        },
      );

      const result = await documentationLoader.loadVersionData({
        product: "editor-prod",
        version: "latest",
        source: "editor",
      });

      expect(client.read).toHaveBeenCalledWith(
        expect.stringContaining("versions.json"),
      );
      expect(result).toEqual(mockData);
    });

    it("should retry on editor load failure", async () => {
      const mockData = { product: "editor-retry", items: [] };
      (client.read as any).mockResolvedValue({
        content: JSON.stringify(mockData),
        encoding: "utf8",
      });

      (loadVersionDataFromProvider as any)
        .mockRejectedValueOnce(new Error("Editor transient error"))
        .mockResolvedValue(mockData);

      const result = await documentationLoader.loadVersionData({
        product: "editor-retry",
        source: "editor",
      });

      expect(result).toEqual(mockData);
      expect(loadVersionDataFromProvider).toHaveBeenCalledTimes(2);
    });

    it("should throw after 3 editor load failures", async () => {
      (loadVersionDataFromProvider as any).mockRejectedValue(
        new Error("Editor persistent error"),
      );

      await expect(
        documentationLoader.loadVersionData({
          product: "editor-fail",
          source: "editor",
        }),
      ).rejects.toThrow("Editor persistent error");

      expect(loadVersionDataFromProvider).toHaveBeenCalledTimes(3);
    });

    it("should throw if editor encoding is not utf8", async () => {
      (client.read as any).mockResolvedValue({
        content: "some content",
        encoding: "base64",
      });

      (loadVersionDataFromProvider as any).mockImplementation(
        async (provider: any) => {
          await provider.readJson("any.json");
          return {};
        },
      );

      await expect(
        documentationLoader.loadVersionData({
          product: "enc-fail",
          source: "editor",
        }),
      ).rejects.toThrow("Unsupported encoding: base64");
    });
  });
});
