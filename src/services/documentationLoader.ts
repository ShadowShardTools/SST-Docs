import type { Version, DocItem, Category } from "../layouts/render/types";
import type { DataProvider } from "./types";
import {
  loadVersions as coreLoadVersions,
  loadVersionData as coreLoadVersionData,
} from ".";

class HttpProvider implements DataProvider {
  async readJson<T>(absUrl: string): Promise<T> {
    const res = await fetch(absUrl);
    if (!res.ok)
      throw new Error(
        `Failed to fetch ${absUrl}: ${res.status} ${res.statusText}`,
      );
    return res.json() as Promise<T>;
  }
}

export class documentationLoader {
  private static provider = new HttpProvider();

  private static getBaseUrl(): string {
    // keeps your previous base url behavior
    const base = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
    return base;
  }

  private static getDataPath(): string {
    const cfg =
      (import.meta.env.VITE_PUBLIC_DATA_PATH as string | undefined) ?? "";
    return `${this.getBaseUrl()}${cfg.replace(/\/$/, "")}`;
  }

  static async loadVersions(): Promise<Version[]> {
    return coreLoadVersions(this.provider, this.getDataPath());
  }

  static async loadVersionData(version: string): Promise<{
    items: DocItem[];
    tree: Category[];
    standaloneDocs: DocItem[];
  }> {
    const versionRoot = `${this.getDataPath()}/${version}`;
    return coreLoadVersionData(this.provider, versionRoot);
  }
}
