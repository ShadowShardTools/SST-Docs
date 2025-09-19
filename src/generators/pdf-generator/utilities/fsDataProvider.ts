import * as fs from "node:fs/promises";
import type { DataProvider } from "../../../services/types";

export class fsDataProvider implements DataProvider {
  async readJson<T>(absPath: string): Promise<T> {
    const text = await fs.readFile(absPath, "utf-8");
    return JSON.parse(text) as T;
  }
  async fileExists(absPath: string): Promise<boolean> {
    try {
      await fs.access(absPath);
      return true;
    } catch {
      return false;
    }
  }
}
