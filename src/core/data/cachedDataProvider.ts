import type { DataProvider } from "../types/DataProvider.js";

/**
 * Interface for persistent cache storage backends.
 */
export interface DataCacheStorage {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  clear(): Promise<void>;
}

/**
 * A DataProvider wrapper that caches JSON results in memory and optionally in persistent storage.
 */
export class CachedDataProvider implements DataProvider {
  private memoryCache = new Map<string, Promise<unknown>>();
  private inner: DataProvider;
  private storage?: DataCacheStorage;

  constructor(inner: DataProvider, storage?: DataCacheStorage) {
    this.inner = inner;
    this.storage = storage;
  }

  async readJson<T>(absPath: string): Promise<T> {
    // 1. Check memory cache
    const memCached = this.memoryCache.get(absPath);
    if (memCached) {
      return memCached as Promise<T>;
    }

    // 2. Wrap the loading logic to handle memory caching and storage
    const loadPromise = (async (): Promise<T> => {
      // 2a. Check persistent storage
      if (this.storage) {
        try {
          const stored = await this.storage.get<T>(absPath);
          if (stored !== null) {
            return stored;
          }
        } catch {
          // Fall through on storage error
        }
      }

      // 2b. Load from source
      const data = await this.inner.readJson<T>(absPath);

      // 2c. Save to storage
      if (this.storage) {
        try {
          await this.storage.set(absPath, data);
        } catch {
          // Ignore storage save errors
        }
      }

      return data;
    })();

    this.memoryCache.set(absPath, loadPromise);
    return loadPromise;
  }

  /**
   * Clears both memory and persistent cache.
   */
  async clear() {
    this.memoryCache.clear();
    if (this.storage) {
      await this.storage.clear();
    }
  }
}
