import { bench, describe, vi } from "vitest";
import { documentationLoader } from "../documentationLoader";
import { loadVersionDataFromHttp } from "@shadow-shard-tools/docs-core/data";

// Mock deps
vi.mock("@shadow-shard-tools/docs-core/data", () => ({
  loadVersionDataFromHttp: vi.fn(),
  loadVersionDataFromProvider: vi.fn(),
}));

vi.mock("@shadow-shard-tools/docs-core/configs/sstDocsConfigShared", () => ({
  resolvePublicDataPath: () => "/data",
}));

// Mock clientConfig
vi.mock("../../application/config/clientConfig", () => ({
  clientConfig: {
    PRODUCT_VERSIONING: false,
  },
}));

vi.stubGlobal("import.meta", {
  env: {
    BASE_URL: "/docs/",
  },
});

// Setup mock data
const hugeItems = Array.from({ length: 1000 }, (_, i) => ({
  id: `item-${i}`,
  title: `Item ${i}`,
  path: `path/to/item-${i}`,
}));

(loadVersionDataFromHttp as any).mockResolvedValue({
  product: "bench-product",
  version: "1.0.0",
  items: hugeItems,
  tree: [],
});

describe("documentationLoader Performance", () => {
  bench(
    "loadVersionData (mocked HTTP)",
    async () => {
      await documentationLoader.loadVersionData({
        product: "bench-product",
        version: "1.0.0",
      });
    },
    { time: 500 },
  );
});
