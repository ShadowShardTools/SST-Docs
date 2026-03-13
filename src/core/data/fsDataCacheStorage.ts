import { mkdir, readFile, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";

import type { DataCacheStorage } from "./cachedDataProvider.js";

/**
 * File system implementation of DataCacheStorage for Node.js environments.
 */
export class FsDataCacheStorage implements DataCacheStorage {
  private cacheDir: string;

  constructor(cacheDir: string) {
    this.cacheDir = cacheDir;
  }

  private getFilePath(key: string): string {
    // Simple hash or encoding for the filename
    const safeName = Buffer.from(key).toString("base64url");
    return join(this.cacheDir, `${safeName}.json`);
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const contents = await readFile(this.getFilePath(key), "utf-8");
      return JSON.parse(contents) as T;
    } catch {
      return null;
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    try {
      await mkdir(this.cacheDir, { recursive: true });
      await writeFile(this.getFilePath(key), JSON.stringify(value), "utf-8");
    } catch {
      // Ignore write errors
    }
  }

  async clear(): Promise<void> {
    try {
      await rm(this.cacheDir, { recursive: true, force: true });
    } catch {
      // Ignore clear errors
    }
  }
}
