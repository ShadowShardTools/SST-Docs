import type { DataProvider } from "../types/DataProvider.js";

export class FsDataProvider implements DataProvider {
  async readJson<T>(_absPath: string): Promise<T> {
    throw new Error(
      "FsDataProvider is only available in Node.js environments where the file system can be read.",
    );
  }
}

export const fsDataProvider = FsDataProvider;
