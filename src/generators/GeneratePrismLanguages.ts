import "dotenv/config";

import fs from "node:fs/promises";
import path from "node:path";
import fg from "fast-glob";
import appRoot from "app-root-path";
import { resolveDataPath, createLogger } from "@shadow-shard-tools/docs-core";

const logger = createLogger("generate-prism-languages");
const projectRoot = appRoot.path;
const outputFile = path.join(
  projectRoot,
  "src",
  "layouts",
  "blocks",
  "generatedImports",
  "prism-languages.generated.ts",
);

type CodeSection = {
  language?: string | null;
};

type CodeData = {
  language?: string | null;
  sections?: CodeSection[] | null;
};

type ContentBlock = {
  type?: string | null;
  codeData?: CodeData | null;
  codeLanguage?: string | null;
  codeSections?: CodeSection[] | null;
};

type DocItem = {
  content?: ContentBlock[];
};

const aliasMap: Record<string, string> = {
  html: "markup",
  xml: "markup",
  svg: "markup",
  js: "javascript",
  node: "javascript",
  ts: "typescript",
  mjs: "javascript",
  cjs: "javascript",
  jsx: "jsx",
  tsx: "tsx",
  shell: "bash",
  sh: "bash",
  zsh: "bash",
  md: "markdown",
  yml: "yaml",
  "c++": "cpp",
  "c#": "csharp",
  cs: "csharp",
  py: "python",
  rb: "ruby",
  kt: "kotlin",
};

const toPosix = (value: string): string =>
  value.split(path.sep).join(path.posix.sep);

const normalizeLanguage = (value?: string | null): string | null => {
  if (!value || typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) {
    return null;
  }
  return aliasMap[trimmed] ?? trimmed;
};

const addLanguage = (target: Set<string>, value?: string | null): void => {
  const normalized = normalizeLanguage(value);
  if (normalized) {
    target.add(normalized);
  }
};

async function collectFromItemFile(
  filePath: string,
  accumulator: Set<string>,
): Promise<void> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as DocItem;
    const blocks = Array.isArray(parsed.content) ? parsed.content : [];

    for (const block of blocks) {
      if (!block || (block.type ?? "").toLowerCase() !== "code") continue;

      const codeData = block.codeData ?? {};

      addLanguage(accumulator, codeData.language);
      addLanguage(accumulator, block.codeLanguage);

      if (Array.isArray(codeData.sections)) {
        for (const section of codeData.sections) {
          addLanguage(accumulator, section?.language);
        }
      }

      if (Array.isArray(block.codeSections)) {
        for (const section of block.codeSections) {
          addLanguage(accumulator, section?.language);
        }
      }
    }
  } catch (error) {
    logger.warn(
      `Failed to parse code block languages from ${filePath}: ${String(error)}`,
    );
  }
}

async function collectLanguages(dataRoot: string): Promise<string[]> {
  const pattern = toPosix(path.join(dataRoot, "**/items/*.json"));
  logger.info(`Scanning code blocks from ${dataRoot}`);

  const files = await fg(pattern, { absolute: true, onlyFiles: true });
  if (files.length === 0) {
    logger.warn(`No item JSON files found with pattern ${pattern}`);
    return [];
  }

  const languages = new Set<string>();
  for (const filePath of files) {
    await collectFromItemFile(filePath, languages);
  }

  return [...languages].sort();
}

async function writeGeneratedFile(languages: string[]): Promise<void> {
  const lines: string[] = [
    "// AUTO-GENERATED FILE. DO NOT EDIT.",
    "// PrismJS components used across all content",
    "",
    ...languages.map(
      (language) => `import "prismjs/components/prism-${language}.js";`,
    ),
    "",
  ];

  await fs.mkdir(path.dirname(outputFile), { recursive: true });
  await fs.writeFile(outputFile, lines.join("\n"));
}

async function main(): Promise<void> {
  logger.info("Generating Prism language imports");

  const dataRoot = resolveDataPath();

  try {
    const stats = await fs.stat(dataRoot);
    if (!stats.isDirectory()) {
      throw new Error("FS data path is not a directory");
    }
  } catch {
    logger.error(`Invalid FS_DATA_PATH: ${dataRoot}`);
    process.exitCode = 1;
    return;
  }

  const languages = await collectLanguages(dataRoot);
  await writeGeneratedFile(languages);

  logger.info(
    `${languages.length} Prism language${
      languages.length === 1 ? "" : "s"
    } written to ${path.relative(projectRoot, outputFile)}`,
  );
}

main().catch((error) => {
  logger.error?.(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
