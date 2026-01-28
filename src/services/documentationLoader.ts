import {
  loadVersionDataFromProvider,
  HttpDataProvider,
} from "@shadow-shard-tools/docs-core/data";
import type { LoadVersionDataFromProviderResult } from "@shadow-shard-tools/docs-core/data/loadVersionData";
import { resolvePublicDataPath } from "@shadow-shard-tools/docs-core/configs/sstDocsConfigShared";
import type { DataProvider } from "@shadow-shard-tools/docs-core/types/DataProvider";
import { clientConfig } from "../application/config/clientConfig";
import { read as editorRead } from "../layouts/editor/api/client";

type DataSource = "http" | "editor";

class EditorApiProvider implements DataProvider {
  async readJson<T>(absPath: string): Promise<T> {
    const normalized = absPath
      .replace(/\\/g, "/")
      .replace(/^\.\/+/, "")
      .replace(/^\/+/, "");
    const res = await editorRead(normalized);
    if (res.encoding !== "utf8") {
      throw new Error(`Unsupported encoding: ${res.encoding}`);
    }
    return JSON.parse(res.content) as T;
  }
}

export class documentationLoader {
  private static getBaseUrl(): string {
    const base = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
    return base;
  }

  private static getDataPath(): string {
    return resolvePublicDataPath(this.getBaseUrl(), clientConfig);
  }

  static async loadVersionData(options?: {
    product?: string;
    version?: string;
    source?: DataSource;
  }): Promise<LoadVersionDataFromProviderResult> {
    if (options?.source === "editor") {
      const provider = new EditorApiProvider();
      const joinEditorPath = (base: string, child: string) => {
        const trimmedBase = base.replace(/\/+$/g, "");
        const trimmedChild = child.replace(/^\/+/g, "");
        if (!trimmedBase) return trimmedChild;
        if (!trimmedChild) return trimmedBase;
        return `${trimmedBase}/${trimmedChild}`;
      };

      const attemptEditor = async () => {
        return await loadVersionDataFromProvider(
          provider,
          "",
          {
            product: options?.product,
            version: options?.version,
            productVersioning: clientConfig.PRODUCT_VERSIONING,
            tolerateMissing: true,
            prefetch: true,
          },
          joinEditorPath,
        );
      };

      let lastError: unknown;
      for (let i = 0; i < 3; i += 1) {
        try {
          return await attemptEditor();
        } catch (err) {
          lastError = err;
          await new Promise((resolve) => setTimeout(resolve, 200));
        }
      }
      throw lastError instanceof Error
        ? lastError
        : new Error("Failed to load documentation data from editor API");
    }

    const base = this.getDataPath();

    const originalFetch = globalThis.fetch;
    const setNoCacheFetch = () => {
      globalThis.fetch = (input: RequestInfo | URL, init?: RequestInit) =>
        originalFetch(input, {
          ...init,
          cache: "reload",
          headers: { "cache-control": "no-cache", ...(init?.headers ?? {}) },
        });
    };

    const attempt = async (useNoCache: boolean) => {
      if (useNoCache) setNoCacheFetch();
      try {
        const httpProvider = new HttpDataProvider();
        return await loadVersionDataFromProvider(httpProvider, base, {
          product: options?.product,
          version: options?.version,
          productVersioning: clientConfig.PRODUCT_VERSIONING,
          prefetch: true,
        });
      } finally {
        if (useNoCache) globalThis.fetch = originalFetch;
      }
    };

    let lastError: unknown;
    for (let i = 0; i < 3; i++) {
      const useNoCache = i > 0;
      try {
        return await attempt(useNoCache);
      } catch (err) {
        lastError = err;
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    }
    throw lastError instanceof Error
      ? lastError
      : new Error("Failed to load documentation data");
  }
}
