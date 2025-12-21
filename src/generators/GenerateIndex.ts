import "dotenv/config";

import { readdir, readFile, writeFile, stat } from "node:fs/promises";
import path from "node:path";
import { resolveDataPath, createLogger } from "@shadow-shard-tools/docs-core";

const logger = createLogger("generate-index");

type ItemFile = {
  id?: string | null;
};

async function listJsonIds(dir: string): Promise<string[]> {
  try {
    const entries = await readdir(dir);
    return entries
      .filter(
        (fileName) => fileName.endsWith(".json") && fileName !== "index.json",
      )
      .map((fileName) => path.basename(fileName, ".json"))
      .sort();
  } catch {
    return [];
  }
}

async function collectItemIds(
  itemsDir: string,
  itemFiles: string[],
): Promise<string[]> {
  const validIds: string[] = [];

  for (const name of itemFiles) {
    const filePath = path.join(itemsDir, `${name}.json`);
    try {
      const raw = await readFile(filePath, "utf8");
      const parsed = JSON.parse(raw) as ItemFile;
      const id = typeof parsed.id === "string" ? parsed.id.trim() : "";

      if (id) {
        validIds.push(id);
      } else {
        logger.warn(`Missing or invalid "id" in ${filePath}`);
      }
    } catch (error) {
      logger.warn(`Failed to parse ${filePath}: ${String(error)}`);
    }
  }

  return validIds;
}

async function generateIndex(versionDir: string): Promise<void> {
  const categoriesDir = path.join(versionDir, "categories");
  const itemsDir = path.join(versionDir, "items");

  const categories = await listJsonIds(categoriesDir);
  const itemNames = await listJsonIds(itemsDir);
  const items = await collectItemIds(itemsDir, itemNames);

  const indexPayload = { categories, items };
  const outputPath = path.join(versionDir, "index.json");

  await writeFile(outputPath, `${JSON.stringify(indexPayload, null, 2)}\n`);
  logger.info(`Wrote ${path.basename(versionDir)}/index.json`);
}

async function main(): Promise<void> {
  const dataDir = resolveDataPath();

  try {
    const stats = await stat(dataDir);
    if (!stats.isDirectory()) {
      throw new Error("FS data path is not a directory");
    }
  } catch {
    logger.error(`Invalid FS_DATA_PATH: ${dataDir}`);
    process.exitCode = 1;
    return;
  }

  logger.info(`Generating version indexes from ${dataDir}`);

  const entries = await readdir(dataDir, { withFileTypes: true });
  const versions = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  if (versions.length === 0) {
    logger.warn("No version directories found.");
    return;
  }

  for (const version of versions) {
    const versionDir = path.join(dataDir, version);
    await generateIndex(versionDir);
  }

  logger.info("All index.json files generated.");
}

main().catch((error) => {
  logger.error?.(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
