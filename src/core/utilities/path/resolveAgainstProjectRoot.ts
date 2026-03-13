import path from "node:path";

import appRoot from "app-root-path";

export function resolveAgainstProjectRoot(candidate: string): string {
  return path.isAbsolute(candidate)
    ? candidate
    : path.join(appRoot.path, candidate);
}
