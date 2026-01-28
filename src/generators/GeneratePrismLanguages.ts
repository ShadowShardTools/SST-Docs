import "dotenv/config";

import fs from "node:fs/promises";
import path from "node:path";
import appRoot from "app-root-path";
import fg from "fast-glob";
import { createLogger, resolveDataPath } from "@shadow-shard-tools/docs-core";
import {
  CODE_LANGUAGE_CONFIG,
  type SupportedLanguage,
} from "@shadow-shard-tools/docs-core/configs/codeLanguagesConfig";

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

async function collectUsedLanguages(
  dataRoot: string,
): Promise<SupportedLanguage[]> {
  const pattern = path
    .join(dataRoot, "**/items/*.json")
    .split(path.sep)
    .join(path.posix.sep);
  logger.info(`Scanning content items in ${dataRoot} for code languages`);

  const files = await fg(pattern, { absolute: true, onlyFiles: true });
  const validLanguages = new Set(
    Object.keys(CODE_LANGUAGE_CONFIG) as SupportedLanguage[],
  );
  const languages = new Set<SupportedLanguage>();

  await Promise.all(
    files.map(async (filePath) => {
      try {
        const raw = await fs.readFile(filePath, "utf8");
        const parsed = JSON.parse(raw) as {
          content?: Array<{ type?: string; codeData?: any }>;
        };
        const blocks = Array.isArray(parsed.content) ? parsed.content : [];
        for (const block of blocks) {
          if (block?.type !== "code") continue;
          const code = block.codeData ?? {};
          const addLang = (lang?: string) => {
            if (
              typeof lang === "string" &&
              validLanguages.has(lang as SupportedLanguage)
            ) {
              languages.add(lang as SupportedLanguage);
            }
          };
          addLang(code.language);
          if (Array.isArray(code.sections)) {
            for (const section of code.sections) {
              addLang(section?.language);
            }
          }
        }
      } catch (err) {
        logger.warn(
          `Failed to parse code file ${path.relative(projectRoot, filePath)}: ${
            err instanceof Error ? err.message : String(err)
          }`,
        );
      }
    }),
  );

  return [...languages].sort();
}

const LANGUAGE_COMPONENT_MAP: Partial<
  Record<SupportedLanguage, string | null>
> = {
  html: "markup",
  xml: "markup",
  dockerfile: "docker",
  plaintext: null,
  text: null,
};

const toPrismComponent = (lang: SupportedLanguage): string | null => {
  const mapped = LANGUAGE_COMPONENT_MAP[lang];
  if (mapped === null) return null;
  return mapped ?? lang;
};

async function main(): Promise<void> {
  const useFull =
    process.env.FULL_PRISM === "1" ||
    process.env.FULL_PRISM === "true" ||
    process.argv.includes("--full");
  const dataRoot = resolveDataPath();

  const languages = useFull
    ? (Object.keys(CODE_LANGUAGE_CONFIG) as SupportedLanguage[])
    : await collectUsedLanguages(dataRoot);

  const resolvedComponents = (
    languages.length > 0 ? languages : (["plaintext"] as SupportedLanguage[])
  )
    .map(toPrismComponent)
    .filter((value): value is string => Boolean(value));

  const uniqueComponents = Array.from(new Set(resolvedComponents)).sort();

  logger.info(
    `Generating Prism language imports (${useFull ? "full list" : "used languages only"})`,
  );

  await writeGeneratedFile(uniqueComponents);

  logger.info(
    `${uniqueComponents.length} Prism language${
      uniqueComponents.length === 1 ? "" : "s"
    } written to ${path.relative(projectRoot, outputFile)}`,
  );
}

main().catch((error) => {
  logger.error?.(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
