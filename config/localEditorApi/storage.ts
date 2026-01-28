import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

export type ProductEntry = { product: string; label: string };
export type VersionEntry = { version: string; label: string };

export function assertPathInsideRoot(root: string, target: string) {
  const resolved = path.resolve(root, target);
  const normalizedRoot = root.endsWith(path.sep) ? root : root + path.sep;
  if (resolved !== root && !resolved.startsWith(normalizedRoot)) {
    throw new Error("Path is outside of the configured data root");
  }
  return resolved;
}

export function isTextFile(filePath: string) {
  const ext = path.extname(filePath).toLowerCase();
  return [
    ".json",
    ".md",
    ".txt",
    ".css",
    ".js",
    ".ts",
    ".tsx",
    ".html",
    ".svg",
  ].includes(ext);
}

export function camelId(value: string): string {
  const parts = value
    .split(/[^a-zA-Z0-9]+/u)
    .filter(Boolean)
    .map((p) => p.trim())
    .filter(Boolean);
  if (!parts.length) return "product";
  const [first, ...rest] = parts;
  return [
    first.charAt(0).toLowerCase() + first.slice(1),
    ...rest.map((p) => p.charAt(0).toUpperCase() + p.slice(1)),
  ].join("");
}

export function randomId(prefix: string) {
  const rand = randomUUID?.() ?? Math.random().toString(36).slice(2, 10);
  return `${prefix}${rand.replace(/-/g, "")}`;
}

export async function readJsonFile<T>(
  filePath: string,
  fallback: T,
): Promise<T> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch (err) {
    if (err instanceof Error && "code" in err && err.code === "ENOENT") {
      return fallback;
    }
    throw err;
  }
}

export async function writeJsonFile(filePath: string, payload: unknown) {
  await fs.writeFile(filePath, JSON.stringify(payload, null, 2));
}

export async function loadProducts(productsPath: string) {
  return readJsonFile<ProductEntry[]>(productsPath, []);
}

export async function saveProducts(
  productsPath: string,
  products: ProductEntry[],
) {
  await writeJsonFile(productsPath, products);
}

export async function loadVersions(versionsPath: string) {
  return readJsonFile<VersionEntry[]>(versionsPath, []);
}

export async function saveVersions(
  versionsPath: string,
  versions: VersionEntry[],
) {
  await writeJsonFile(versionsPath, versions);
}

export async function initVersionDirectory(versionDir: string) {
  await fs.mkdir(path.join(versionDir, "categories"), { recursive: true });
  await fs.mkdir(path.join(versionDir, "items"), { recursive: true });
  await fs.mkdir(path.join(versionDir, "audio"), { recursive: true });
  await fs.mkdir(path.join(versionDir, "images"), { recursive: true });
  await writeJsonFile(path.join(versionDir, "index.json"), {
    categories: [],
    items: [],
  });
}

export async function initProductDirectory(
  productDir: string,
  firstVersion: VersionEntry,
) {
  await fs.mkdir(productDir, { recursive: true });
  const versionsPath = path.join(productDir, "versions.json");
  await saveVersions(versionsPath, [firstVersion]);
  const versionDir = path.join(productDir, firstVersion.version);
  await initVersionDirectory(versionDir);
}
