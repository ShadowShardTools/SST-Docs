import { resolve, dirname, join } from "node:path";
import { access } from "node:fs/promises";

export function resolveOutputRoot(outDir: string | undefined, cwd: string) {
  return resolve(cwd, outDir ?? "dist-static");
}

export function resolveDataRoot(dataRoot: string | undefined, cwd: string) {
  const suggested = resolve(cwd, dataRoot ?? "public/SST-Docs/data");
  return suggested;
}

export function normaliseBasePath(basePath: string | undefined) {
  if (!basePath) return "/";
  if (basePath === "/") return "/";
  const trimmed = basePath.replace(/\/+$/, "");
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

export async function pathExists(pathLike: string): Promise<boolean> {
  try {
    await access(pathLike);
    return true;
  } catch {
    return false;
  }
}

export function normalisePathSegments(target: string, relative: string) {
  return resolve(dirname(target), relative);
}

export function joinUrl(...parts: string[]) {
  const cleaned = parts
    .map((segment) => segment.replace(/^\/+|\/+$/g, ""))
    .filter(Boolean);
  if (cleaned.length === 0) return "/";
  return `/${cleaned.join("/")}/`;
}

export function joinRelativePath(...segments: string[]) {
  return join(...segments);
}
