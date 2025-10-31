import { readFile, access } from "node:fs/promises";
import { constants } from "node:fs";
import type { DataProvider } from "../../../services/types";

export class FileSystemProvider implements DataProvider {
  async readJson<T>(absPath: string): Promise<T> {
    const contents = await readFile(absPath, "utf8");
    return JSON.parse(contents) as T;
  }

  async fileExists(absPath: string): Promise<boolean> {
    try {
      await access(absPath, constants.F_OK);
      return true;
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") return false;
      throw err;
    }
  }
}
