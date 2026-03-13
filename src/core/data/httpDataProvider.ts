import type { DataProvider } from "../index.js";

export type HttpDataProviderOptions = {
  fetch?: typeof fetch;
  retries?: number;
  retryDelayMs?: number;
};

export class HttpDataProvider implements DataProvider {
  private readonly options: HttpDataProviderOptions;

  constructor(options: HttpDataProviderOptions = {}) {
    this.options = options;
  }

  async readJson<T>(absUrl: string): Promise<T> {
    const fetcher = this.options.fetch ?? fetch;
    const retries = this.options.retries ?? 0;
    const delay = this.options.retryDelayMs ?? 150;

    let lastError: Error | undefined;
    for (let i = 0; i <= retries; i += 1) {
      try {
        let res;
        try {
          res = await fetcher(absUrl);
        } catch (error) {
          throw new Error(
            `Failed to fetch ${absUrl}: ${(error as Error).message}`,
          );
        }

        if (!res.ok) {
          throw new Error(
            `Failed to fetch ${absUrl}: ${res.status} ${res.statusText}`,
          );
        }

        const contentType = res.headers.get("content-type") ?? "";
        const raw = await res.text();

        if (
          contentType.includes("text/html") ||
          raw.trim().startsWith("<!doctype")
        ) {
          throw new Error(
            `Received HTML for ${absUrl} (likely 404 or dev server fallback)`,
          );
        }

        try {
          return (await JSON.parse(raw)) as T;
        } catch (error) {
          throw new Error(
            `Failed to parse JSON from ${absUrl}: ${(error as Error).message}`,
          );
        }
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (i < retries) {
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError ?? new Error(`Failed to fetch ${absUrl}`);
  }
}

export const httpDataProvider = HttpDataProvider;
