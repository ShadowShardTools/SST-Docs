import { constants } from "node:fs";
import { access } from "node:fs/promises";

export async function pathExists(pathLike: string): Promise<boolean> {
  try {
    await access(pathLike, constants.F_OK);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw error;
  }
}
