import "dotenv/config";

import fs from "node:fs/promises";
import path from "node:path";
import appRoot from "app-root-path";
import fg from "fast-glob";
import { createLogger, resolveDataPath } from "@shadow-shard-tools/docs-core";
import {
  DEFAULT_BLOCKS,
  type BlockType,
} from "../layouts/editor/blocks/blockRegistry";

const logger = createLogger("generate-block-imports");

const projectRoot = appRoot.path;
const blockComponentsDir = path.join(
  projectRoot,
  "src",
  "layouts",
  "blocks",
  "components",
);
const generatedDir = path.join(
  projectRoot,
  "src",
  "layouts",
  "blocks",
  "generatedImports",
);
const outputFile = path.join(generatedDir, "blockImports.generated.ts");

const toPosix = (value: string): string =>
  value.split(path.sep).join(path.posix.sep);

const toRelativeImport = (from: string, to: string): string => {
  let relativePath = path.relative(path.dirname(from), to);
  if (!relativePath.startsWith(".")) {
    relativePath = `.${path.sep}${relativePath}`;
  }
  return toPosix(relativePath);
};

const toComponentName = (type: string): string => {
  if (/^title-h[123]$/u.test(type)) {
    const suffix = type.split("-")[1]?.toUpperCase();
    return `Title${suffix}Block`;
  }

  return (
    type
      .split(/[-_]/u)
      .map((part) =>
        part ? `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}` : "",
      )
      .join("") + "Block"
  );
};

async function collectBlockTypes(dataRoot: string): Promise<BlockType[]> {
  const pattern = toPosix(path.join(dataRoot, "**/items/*.json"));
  logger.info(`Scanning content items in ${dataRoot}`);

  const files = await fg(pattern, { absolute: true, onlyFiles: true });

  if (files.length === 0) {
    logger.warn(`No item JSON files found with pattern ${pattern}`);
  }

  const blockTypes = new Set<string>();

  await Promise.all(
    files.map(async (filePath) => {
      try {
        const raw = await fs.readFile(filePath, "utf8");
        const parsed = JSON.parse(raw) as {
          content?: { type?: string | null }[];
        };
        const blocks = Array.isArray(parsed.content) ? parsed.content : [];

        for (const block of blocks) {
          if (typeof block?.type === "string") {
            const trimmed = block.type.trim();
            if (trimmed) {
              blockTypes.add(trimmed);
            }
          }
        }
      } catch (err) {
        logger.warn(
          `Failed to parse block file ${path.relative(projectRoot, filePath)}: ${
            err instanceof Error ? err.message : String(err)
          }`,
        );
      }
    }),
  );

  return [...blockTypes].sort() as BlockType[];
}

async function writeGeneratedFile(blockTypes: BlockType[]): Promise<void> {
  const lines: string[] = [
    "// AUTO-GENERATED FILE. DO NOT EDIT.",
    'import { lazy } from "react";',
    "",
    "export const blockImports = {",
    ...blockTypes.map((blockType) => {
      const componentPath = path.join(
        blockComponentsDir,
        toComponentName(blockType),
      );
      const importPath = toRelativeImport(outputFile, componentPath);
      return `  "${blockType}": lazy(() => import("${importPath}")),`;
    }),
    `  "unknown": lazy(() => import("${toRelativeImport(
      outputFile,
      path.join(blockComponentsDir, "UnknownBlock"),
    )}")),`,
    "} as const;",
    "",
    "export type BlockType = keyof typeof blockImports;",
    "",
  ];

  await fs.mkdir(generatedDir, { recursive: true });
  await fs.writeFile(outputFile, `${lines.join("\n")}`);
}

async function main(): Promise<void> {
  const useFull =
    process.env.FULL_BLOCKS === "1" ||
    process.env.FULL_BLOCKS === "true" ||
    process.argv.includes("--full");
  const dataRoot = resolveDataPath();

  const blockTypes = useFull
    ? (Object.keys(DEFAULT_BLOCKS).sort() as BlockType[])
    : await collectBlockTypes(dataRoot);

  await writeGeneratedFile(blockTypes);

  logger.info(
    `${blockTypes.length} block type${
      blockTypes.length === 1 ? "" : "s"
    } written to ${path.relative(projectRoot, outputFile)}`,
  );
}

main().catch((error) => {
  logger.error?.(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
