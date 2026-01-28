import { resolveVersionsPath } from "../../utilities/editorPaths";
import type { ReadFn } from "./types";

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

export const readJsonFile = async (read: ReadFn, path: string) => {
  const res = await read(path);
  if (res.encoding !== "utf8") {
    throw new Error(`Unsupported encoding: ${res.encoding}`);
  }
  return JSON.parse(res.content);
};

const waitForJson = async (
  readJson: (path: string) => Promise<any>,
  path: string,
  attempts = 20,
  delay = 150,
) => {
  for (let i = 0; i < attempts; i += 1) {
    try {
      await readJson(path);
      return true;
    } catch {
      await wait(delay);
    }
  }
  return false;
};

export const waitForProductReady = async ({
  productVersioning,
  productId,
  versionId,
  readJson,
}: {
  productVersioning: boolean;
  productId?: string;
  versionId?: string;
  readJson: (path: string) => Promise<any>;
}) => {
  const versionsPath = resolveVersionsPath(productVersioning, productId);
  if (!versionsPath) return false;
  const versionsReady = await waitForJson(readJson, versionsPath);
  if (!versionsReady) return false;

  let versionsData: Array<{ version: string }> = [];
  try {
    versionsData = await readJson(versionsPath);
  } catch {
    // ignore
  }
  const targetVersion = versionId ?? versionsData[0]?.version ?? undefined;
  if (!targetVersion) return true;
  const prefix = productVersioning && productId ? `${productId}/` : "";
  return await waitForJson(readJson, `${prefix}${targetVersion}/index.json`);
};
