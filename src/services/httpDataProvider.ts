import type { DataProvider } from "./types";

export class httpDataProvider implements DataProvider {
  async readJson<T>(absUrl: string): Promise<T> {
    const res = await fetch(absUrl);
    if (!res.ok)
      throw new Error(
        `Failed to fetch ${absUrl}: ${res.status} ${res.statusText}`,
      );
    return res.json() as Promise<T>;
  }
}
