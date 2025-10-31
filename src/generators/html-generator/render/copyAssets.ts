import { resolve, join, dirname, normalize, relative } from "node:path";
import {
  mkdir,
  copyFile,
  readFile,
  writeFile,
  readdir,
  stat,
} from "node:fs/promises";
import type { VersionRenderEntry } from "./buildPlan";
import type { GeneratorConfig } from "../types";
import type { Logger } from "../utils/logger";

const STYLESHEET_TARGET = "site.css";
const ASSET_SOURCE_DIR = "dist/assets";
const PRISM_THEME_SOURCE = "node_modules/prismjs/themes/prism-tomorrow.css";
const PRISM_THEME_TARGET = "prism-tomorrow.css";
const CODE_TABS_TARGET = "static-code-block.css";
const CAROUSEL_STYLE_TARGET = "static-carousel.css";
const COMPARE_STYLE_TARGET = "static-compare.css";

const KATEX_PREFIX = "KaTeX_";

const KATEX_URL_PATTERN = /url\((['"]?)\/SST-Docs\/assets\//g;
const MEDIA_PATH_REGEX = /^\/?SST-Docs\/data\/([^/]+)\/(.+)$/i;

const STATIC_CODE_TABS_CSS = `/* Static code block enhancements */
.static-code-block { background-color: inherit; border-radius: inherit; position: relative; }
.static-code-tab-input { position: absolute; opacity: 0; pointer-events: none; }
.static-code-header { position: relative; z-index: 1; }
.static-code-tab-labels { display: inline-flex; flex-wrap: wrap; gap: 0.45rem; align-items: center; }
.static-code-tab-label { display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.3rem 0.65rem; font-size: 0.75rem; border-radius: 9999px; cursor: pointer; border: 1px solid rgba(148, 163, 184, 0.35); background-color: rgba(148, 163, 184, 0.12); transition: background-color 150ms ease, border-color 150ms ease, color 150ms ease; }
.static-code-tab-label:hover { background-color: rgba(148, 163, 184, 0.22); }
.static-code-tab-panels { position: relative; display: flex; flex-direction: column; gap: 1.25rem; }
.static-code-panel { position: relative; border-radius: inherit; overflow: hidden; }
.static-code-panel pre { margin: 0; }
.static-code-language-badge { position: absolute; top: 0.75rem; right: 0.75rem; font-size: 0.75rem; display: inline-flex; align-items: center; gap: 0.25rem; padding: 0.2rem 0.55rem; border-radius: 9999px; background-color: rgba(15, 23, 42, 0.08); }
@media (prefers-color-scheme: dark) {
  .static-code-tab-label { background-color: rgba(148, 163, 184, 0.16); border-color: rgba(148, 163, 184, 0.26); color: #e2e8f0; }
  .static-code-tab-label:hover { background-color: rgba(148, 163, 184, 0.28); }
  .static-code-language-badge { background-color: rgba(148, 163, 184, 0.24); color: #e2e8f0; }
}
`;
const STATIC_CAROUSEL_CSS = `/* Static image carousel */
.static-carousel { position: relative; width: 100%; margin: 0 auto; }
.static-carousel-input { position: absolute; opacity: 0; pointer-events: none; }
.static-carousel-viewport { list-style: none; margin: 0; padding: 0; position: relative; }
.static-carousel-slide { display: none; position: relative; flex-direction: column; gap: 0.75rem; align-items: center; justify-content: center; text-align: center; }
.static-carousel-slide figure { width: 100%; margin: 0; display: flex; flex-direction: column; }
.static-carousel-slide img { width: 100%; height: auto; display: block; }
.static-carousel-navlinks { position: absolute; inset: 0; pointer-events: none; }
.static-carousel-prev,
.static-carousel-next { pointer-events: auto; position: absolute; top: 50%; transform: translateY(-50%); width: 2.25rem; height: 2.25rem; border-radius: 9999px; background-color: rgba(255, 255, 255, 0.6); color: rgba(15, 23, 42, 0.9); display: inline-flex; align-items: center; justify-content: center; text-decoration: none; font-size: 1.25rem; font-weight: 600; transition: background-color 150ms ease, transform 150ms ease; cursor: pointer; border: none; }
.static-carousel-prev { left: 0.75rem; }
.static-carousel-next { right: 0.75rem; }
.static-carousel-prev::before,
.static-carousel-next::before { content: ""; width: 0.55rem; height: 0.55rem; border-top: 2px solid currentColor; border-right: 2px solid currentColor; transform: rotate(225deg); }
.static-carousel-next::before { transform: rotate(45deg); }
.static-carousel-prev:hover,
.static-carousel-next:hover,
.static-carousel-prev:focus-visible,
.static-carousel-next:focus-visible { background-color: rgba(255, 255, 255, 0.85); outline: none; color: #0f172a; }
`;
const STATIC_COMPARE_CSS = `/* Static image comparison slider */
.static-compare { position: relative; width: 100%; margin: 0 auto; overflow: hidden; --static-compare-position: 50%; }
.static-compare-figure { position: relative; margin: 0; overflow: hidden; }
.static-compare-image { display: block; width: 100%; height: auto; object-fit: cover; }
.static-compare-overlay { position: absolute; inset: 0; overflow: hidden; pointer-events: none; clip-path: inset(0 calc(100% - var(--static-compare-position, 50%)) 0 0); }
.static-compare-overlay img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }
.static-compare-handle { position: absolute; top: 0; bottom: 0; left: calc(var(--static-compare-position, 50%)); transform: translateX(-50%); pointer-events: none; display: flex; align-items: center; justify-content: center; }
.static-compare-handle::before { content: ""; position: absolute; top: 0; bottom: 0; width: 2px; background: rgba(255, 255, 255, 0.8); }
.static-compare-controls { display: flex; flex-direction: column; gap: 0.75rem; padding: 1rem; align-items: center; }
.static-compare-range { width: 100%; -webkit-appearance: none; appearance: none; height: 0.5rem; border-radius: 9999px; background: #d6d3d1; outline: none; cursor: pointer; position: relative; }
.static-compare-range::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 1.3rem; height: 1.3rem; border-radius: 50%; background: #79716b; border: 3px solid #57534d; cursor: pointer; transition: transform 150ms ease; }
.static-compare-range::-webkit-slider-thumb:hover { transform: scale(1.05); }
.static-compare-range::-moz-range-thumb { width: 1.3rem; height: 1.3rem; border-radius: 50%; background: #79716b; border: 3px solid #57534d; cursor: pointer; transition: transform 150ms ease; }
.static-compare-range::-moz-range-thumb:hover { transform: scale(1.05); }
.static-compare-summary { text-align: center; font-size: 0.9rem; }
.static-compare-noscript { margin-top: 0.75rem; font-size: 0.85rem; text-align: center; }
`;

async function copyKaTeXAssets(
  cwd: string,
  assetsDir: string,
  logger: Logger,
): Promise<void> {
  const sourceDir = resolve(cwd, ASSET_SOURCE_DIR);
  const targetDir = assetsDir;

  try {
    await mkdir(targetDir, { recursive: true });
    const entries = await readdir(sourceDir, { withFileTypes: true });
    await Promise.all(
      entries
        .filter(
          (entry) => entry.isFile() && entry.name.startsWith(KATEX_PREFIX),
        )
        .map((entry) =>
          copyFile(join(sourceDir, entry.name), join(targetDir, entry.name)),
        ),
    );
    logger.debug("Copied KaTeX font assets");
  } catch (error) {
    logger.warn(
      `Failed to copy KaTeX font assets. Math blocks may render incorrectly offline. (${String(
        error,
      )})`,
    );
  }
}

const locateStylesheetSource = async (
  cwd: string,
  logger: Logger,
): Promise<{ absolutePath: string; fileName: string } | null> => {
  const assetsDir = resolve(cwd, ASSET_SOURCE_DIR);
  try {
    const entries = await readdir(assetsDir, { withFileTypes: true });
    const cssFiles = entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".css"))
      .map((entry) => entry.name);
    if (!cssFiles.length) {
      logger.warn(
        "No CSS assets found in dist. Run `npm run build` before generating static HTML.",
      );
      return null;
    }
    const primary =
      cssFiles.find((name) => /^index-.*\.css$/i.test(name)) ?? cssFiles[0];
    return {
      absolutePath: resolve(assetsDir, primary),
      fileName: primary,
    };
  } catch (error) {
    logger.warn(
      `Failed to inspect ${ASSET_SOURCE_DIR} for stylesheet assets. (${String(
        error,
      )})`,
    );
    return null;
  }
};

async function copyStylesheet(
  cwd: string,
  assetsDir: string,
  logger: Logger,
): Promise<void> {
  const located = await locateStylesheetSource(cwd, logger);
  if (!located) return;

  const { absolutePath: sourcePath, fileName } = located;
  const targetPath = resolve(assetsDir, STYLESHEET_TARGET);

  await mkdir(assetsDir, { recursive: true });

  try {
    const css = await readFile(sourcePath, "utf8");
    const rewritten = css.replace(KATEX_URL_PATTERN, "url($1./");
    await writeFile(targetPath, rewritten, "utf8");
    logger.debug(`Copied stylesheet ${fileName} to ${STYLESHEET_TARGET}`);
  } catch (error) {
    logger.warn(
      `Failed to copy stylesheet from ${sourcePath}. Generated pages may be unstyled. (${String(
        error,
      )})`,
    );
  }
}

async function copyPrismTheme(
  cwd: string,
  assetsDir: string,
  logger: Logger,
): Promise<void> {
  const sourcePath = resolve(cwd, PRISM_THEME_SOURCE);
  const targetPath = resolve(assetsDir, PRISM_THEME_TARGET);
  try {
    await mkdir(assetsDir, { recursive: true });
    await copyFile(sourcePath, targetPath);
    logger.debug(`Copied Prism theme to ${PRISM_THEME_TARGET}`);
  } catch (error) {
    logger.warn(
      `Failed to copy Prism theme. Code highlighting may lack styling. (${String(
        error,
      )})`,
    );
  }
}

async function writeStaticCodeStyles(assetsDir: string, logger: Logger) {
  const targetPath = resolve(assetsDir, CODE_TABS_TARGET);
  try {
    await mkdir(assetsDir, { recursive: true });
    await writeFile(targetPath, STATIC_CODE_TABS_CSS, "utf8");
    logger.debug(`Wrote static code block styles to ${CODE_TABS_TARGET}`);
  } catch (error) {
    logger.warn(`Failed to write code block styles. (${String(error)})`);
  }
}

async function writeStaticCarouselStyles(assetsDir: string, logger: Logger) {
  const targetPath = resolve(assetsDir, CAROUSEL_STYLE_TARGET);
  try {
    await mkdir(assetsDir, { recursive: true });
    await writeFile(targetPath, STATIC_CAROUSEL_CSS, "utf8");
    logger.debug(`Wrote static carousel styles to ${CAROUSEL_STYLE_TARGET}`);
  } catch (error) {
    logger.warn(`Failed to write carousel styles. (${String(error)})`);
  }
}

async function writeStaticCompareStyles(assetsDir: string, logger: Logger) {
  const targetPath = resolve(assetsDir, COMPARE_STYLE_TARGET);
  try {
    await mkdir(assetsDir, { recursive: true });
    await writeFile(targetPath, STATIC_COMPARE_CSS, "utf8");
    logger.debug(`Wrote static compare styles to ${COMPARE_STYLE_TARGET}`);
  } catch (error) {
    logger.warn(`Failed to write image compare styles. (${String(error)})`);
  }
}

const collectMediaPathsFromValue = (
  value: unknown,
  paths: Set<string>,
  currentVersion: string,
) => {
  if (!value) return;

  if (typeof value === "string") {
    const match = value.match(MEDIA_PATH_REGEX);
    if (match) {
      const versionId = match[1];
      const pathInsideVersion = match[2];
      if (versionId === currentVersion) {
        const normalized = normalize(pathInsideVersion).replace(/^[\\/]+/, "");
        paths.add(normalized);
      }
    }
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item) =>
      collectMediaPathsFromValue(item, paths, currentVersion),
    );
    return;
  }

  if (typeof value === "object") {
    Object.values(value as Record<string, unknown>).forEach((item) =>
      collectMediaPathsFromValue(item, paths, currentVersion),
    );
  }
};

const collectMediaPaths = (entry: VersionRenderEntry): Set<string> => {
  const paths = new Set<string>();
  const versionId = entry.version.version;

  entry.items.forEach((doc) => {
    collectMediaPathsFromValue(doc.content, paths, versionId);
  });
  entry.tree.forEach((category) => {
    collectMediaPathsFromValue(category.content, paths, versionId);
  });
  entry.standaloneDocs.forEach((doc) => {
    collectMediaPathsFromValue(doc.content, paths, versionId);
  });

  return paths;
};

async function copyReferencedMedia(
  entry: VersionRenderEntry,
  config: GeneratorConfig,
  logger: Logger,
  mediaPaths: string[],
) {
  if (!config.separateBuildForHtmlGenerator) {
    return;
  }
  if (mediaPaths.length === 0) return;

  const publicRoot = resolve(config.cwd, "public", "SST-Docs", "data");
  const versionOutDir = resolve(config.outDir, entry.version.version);

  await Promise.all(
    mediaPaths.map(async (insideVersionPath) => {
      const sourcePath = resolve(
        publicRoot,
        entry.version.version,
        insideVersionPath,
      );
      const targetPath = resolve(versionOutDir, insideVersionPath);

      try {
        const stats = await stat(sourcePath);
        if (!stats.isFile()) {
          logger.warn(
            `Skipping non-file media asset ${insideVersionPath} for version ${entry.version.version}`,
          );
          return;
        }
      } catch (error) {
        logger.warn(
          `Missing media asset referenced in version ${entry.version.version}: ${insideVersionPath} (${String(
            error,
          )})`,
        );
        return;
      }

      try {
        await mkdir(dirname(targetPath), { recursive: true });
        await copyFile(sourcePath, targetPath);
        logger.debug(
          `Copied media asset for ${entry.version.version}: ${insideVersionPath}`,
        );
      } catch (error) {
        logger.warn(
          `Failed to copy media asset ${insideVersionPath} for ${entry.version.version}: ${String(
            error,
          )}`,
        );
      }
    }),
  );
}

async function collectFilesRecursive(
  root: string,
  prefix = "",
): Promise<string[]> {
  const dirPath = prefix ? resolve(root, prefix) : root;
  const entries = await readdir(dirPath, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      const nested = await collectFilesRecursive(root, relativePath);
      files.push(...nested);
    } else if (relativePath !== "assets-manifest.json") {
      files.push(relativePath.replace(/\\/g, "/"));
    }
  }
  return files;
}

async function writeAssetsManifest(root: string, logger: Logger) {
  try {
    await mkdir(root, { recursive: true });
    const files = await collectFilesRecursive(root);
    const manifestPath = resolve(root, "assets-manifest.json");
    await writeFile(
      manifestPath,
      JSON.stringify(files.sort(), null, 2),
      "utf8",
    );
    logger.debug(
      `Updated assets manifest at ${relative(process.cwd(), manifestPath)} (${files.length} entries)`,
    );
  } catch (error) {
    logger.warn(
      `Failed to write assets manifest in ${relative(process.cwd(), root)}: ${String(
        error,
      )}`,
    );
  }
}

export async function copyVersionAssets(
  entry: VersionRenderEntry,
  config: GeneratorConfig,
  logger: Logger,
  assetsDir: string,
): Promise<{ mediaPaths: string[] }> {
  const mediaPaths = Array.from(collectMediaPaths(entry))
    .map((path) => path.replace(/\\/g, "/"))
    .sort();

  await copyStylesheet(config.cwd, assetsDir, logger);
  await copyPrismTheme(config.cwd, assetsDir, logger);
  await writeStaticCodeStyles(assetsDir, logger);
  await writeStaticCarouselStyles(assetsDir, logger);
  await writeStaticCompareStyles(assetsDir, logger);
  await copyKaTeXAssets(config.cwd, assetsDir, logger);
  await writeAssetsManifest(assetsDir, logger);
  await copyReferencedMedia(entry, config, logger, mediaPaths);

  return { mediaPaths };
}
