import { loadVersions } from "@shadow-shard-tools/docs-core/data/loadVersions";
import { loadVersionData } from "@shadow-shard-tools/docs-core/data/loadVersionData";
import { httpDataProvider } from "@shadow-shard-tools/docs-core/data/httpDataProvider";
import type {
  Category,
  DocItem,
  Version,
} from "@shadow-shard-tools/docs-core/types";
import { clientConfig } from "../application/config/clientConfig";

function normalizePath(input: string): string {
  const trimmed = input.trim();
  const withoutLeading = trimmed.replace(/^\/+/, "");
  const withoutTrailing = withoutLeading.replace(/\/+$/, "");
  return withoutTrailing;
}

function resolvePublicDataPath(baseUrl: string, config: unknown): string {
  const publicPath =
    typeof config === "string"
      ? config
      : // @ts-expect-error docs-core client config shape
        (config?.PUBLIC_DATA_PATH ??
        // @ts-expect-error fallback to FS_DATA_PATH if needed
        config?.FS_DATA_PATH ??
        "/");

  const normalizedPublic = normalizePath(publicPath);

  // Absolute URL base (rare in Vite, but supported)
  try {
    const parsed = new URL(baseUrl);
    const joined = normalizePath(
      `${parsed.pathname}/${normalizedPublic}` || normalizedPublic,
    );
    parsed.pathname = `/${joined}/`;
    return parsed.toString();
  } catch {
    // Non-absolute base (most Vite cases)
    const normalizedBase = normalizePath(baseUrl || "/");
    const joined = [normalizedBase, normalizedPublic]
      .filter(Boolean)
      .join("/")
      .replace(/\/+$/, "");
    return `/${joined}/`;
  }
}

export class documentationLoader {
  private static provider = new httpDataProvider();

  private static getBaseUrl(): string {
    // keeps your previous base url behavior
    const base = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
    return base;
  }

  private static getDataPath(): string {
    return resolvePublicDataPath(this.getBaseUrl(), clientConfig);
  }

  static async loadVersions(): Promise<Version[]> {
    return loadVersions(this.provider, this.getDataPath());
  }

  static async loadVersionData(version: string): Promise<{
    items: DocItem[];
    tree: Category[];
    standaloneDocs: DocItem[];
  }> {
    const versionRoot = `${this.getDataPath()}/${version}`;
    return loadVersionData(this.provider, versionRoot);
  }
}
