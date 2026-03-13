import { readFile } from "node:fs/promises";

import type { DataProvider } from "../index.js";

export class FsDataProvider implements DataProvider {
  async readJson<T>(absPath: string): Promise<T> {
    let contents: string;
    try {
      contents = await readFile(absPath, "utf8");
    } catch (error) {
      throw new Error(
        `Failed to read JSON from ${absPath}: ${(error as Error).message}`,
      );
    }

    try {
      return JSON.parse(contents) as T;
    } catch (error) {
      throw new Error(
        `Failed to parse JSON from ${absPath}: ${(error as Error).message}`,
      );
    }
  }
}

export const fsDataProvider = FsDataProvider;
