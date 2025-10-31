import { resolve, dirname, relative, posix as pathPosix } from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import type { VersionRenderEntry } from "./buildPlan";
import type { GeneratorConfig } from "../types";
import type { Logger } from "../utils/logger";
import {
  buildNavigationIndex,
  type NavDocumentEntry,
  type NavigationIndex,
} from "./structure/navigation";
import { renderDocumentPage } from "./structure/renderDocument";
import { renderCategoryPage } from "./structure/renderCategory";
import { renderPageShell } from "./structure/pageShell";
import { ChartAssetManager } from "./chartAssets";
import type { ChartData } from "../../../layouts/blocks/types/ChartData";
import { copyVersionAssets } from "./copyAssets";

const MEDIA_PATH_REGEX = /^\/?SST-Docs\/data\/([^/]+)\/(.+)$/i;

const getDefaultDocument = (
  navIndex: NavigationIndex,
): NavDocumentEntry | undefined => {
  if (navIndex.standaloneDocuments.length > 0) {
    return navIndex.standaloneDocuments[0];
  }

  for (const doc of navIndex.documents.values()) {
    if (!doc.isStandalone) {
      return doc;
    }
  }

  const iterator = navIndex.documents.values().next();
  return iterator.done ? undefined : iterator.value;
};

export async function renderVersion(
  entry: VersionRenderEntry,
  config: GeneratorConfig,
  logger: Logger,
) {
  const versionBaseDir = resolve(config.outDir, entry.version.version);
  const siteOutDir = config.separateBuildForHtmlGenerator
    ? versionBaseDir
    : resolve(versionBaseDir, "static");

  await mkdir(siteOutDir, { recursive: true });
  if (!config.separateBuildForHtmlGenerator) {
    await mkdir(versionBaseDir, { recursive: true });
  }

  const navIndex = buildNavigationIndex(entry, config);
  const chartAssetManager = new ChartAssetManager(
    config.theme,
    siteOutDir,
    logger,
  );

  const assetsDir = config.staticAssetsDir;

  const computeAssets = (pagePath: string, pageRelative: string) => {
    const pageDir = dirname(pagePath);
    const logicalRelative = pageRelative.replace(/\\/g, "/");
    const logicalDirRaw = pathPosix.dirname(logicalRelative);
    const logicalDir = logicalDirRaw === "." ? "" : logicalDirRaw;

    const toLogicalHref = (target: string) => {
      const rel = pathPosix.relative(logicalDir, target);
      if (rel === "") return "./";
      return rel;
    };

    const resolveGlobalAssetHref = (fileName: string) => {
      if (!config.separateBuildForHtmlGenerator) {
        return toLogicalHref(pathPosix.join("static-styles", fileName));
      }
      const assetPath = resolve(assetsDir, fileName);
      let relPath = relative(pageDir, assetPath).replace(/\\/g, "/");
      if (!relPath.startsWith(".") && !relPath.startsWith("..")) {
        relPath = `./${relPath}`;
      }
      return relPath;
    };

    const resolveAssetHref = (original: string) => {
      const match = original.match(MEDIA_PATH_REGEX);
      if (!match) return original;
      const [, versionId, insideVersion] = match;
      if (versionId !== entry.version.version) return original;
      if (!config.separateBuildForHtmlGenerator) {
        const logicalTarget = insideVersion.replace(/\\/g, "/");
        return toLogicalHref(logicalTarget);
      }
      const assetPath = resolve(config.outDir, versionId, insideVersion);
      let rel = relative(pageDir, assetPath).replace(/\\/g, "/");
      if (!rel.startsWith(".") && !rel.startsWith("..")) {
        rel = `./${rel}`;
      }
      return rel;
    };

    const extras = [
      "prism-tomorrow.css",
      "static-code-block.css",
      "static-carousel.css",
      "static-compare.css",
    ];
    const additional = Array.from(
      new Set(extras.map((name) => resolveGlobalAssetHref(name))),
    );

    return {
      stylesheet: resolveGlobalAssetHref("site.css"),
      additional,
      resolveAssetHref,
    };
  };

  const makeHrefResolver = (pagePath: string) => {
    const pageDir = dirname(pagePath);
    return (targetRelative: string) => {
      const targetAbs = resolve(siteOutDir, targetRelative);
      const rel = relative(pageDir, targetAbs).replace(/\\/g, "/");
      return rel.startsWith("..") || rel.startsWith(".") ? rel : `./${rel}`;
    };
  };

  const landingPath = resolve(siteOutDir, "index.html");
  const defaultDoc = getDefaultDocument(navIndex);
  const landingResolver = makeHrefResolver(landingPath);
  const landingStyles = computeAssets(landingPath, "index.html");
  const categoryPages: string[] = [];
  const docPages: string[] = [];

  if (defaultDoc) {
    const landingDir = dirname(landingPath);
    await chartAssetManager.prepareContent(defaultDoc.content);
    const landingHtml = renderDocumentPage(
      defaultDoc,
      navIndex,
      config,
      landingStyles.stylesheet,
      landingStyles.additional,
      landingResolver,
      landingStyles.resolveAssetHref,
      (chartData: ChartData, targetWidth: number) =>
        chartAssetManager.getAssetHref(chartData, landingDir, targetWidth),
    );
    await writeFile(landingPath, landingHtml, "utf8");
  } else {
    logger.warn(
      `No documentation pages available to render default landing for ${entry.version.version}`,
    );
    const placeholderContent = `<div class="px-2 md:px-6">
    <div class="max-w-4xl mx-auto py-12 text-center text-gray-500">
      Documentation for this version is not available yet.
    </div>
  </div>`;
    const placeholderHtml = renderPageShell({
      title: navIndex.versionLabel,
      mainContent: placeholderContent,
      navIndex,
      config,
      stylesheetHref: landingStyles.stylesheet,
      additionalStylesheets: landingStyles.additional,
      resolveHref: landingResolver,
      breadcrumb: [{ label: navIndex.versionLabel }],
    });
    await writeFile(landingPath, placeholderHtml, "utf8");
  }

  for (const category of navIndex.categories.values()) {
    const relativePath = category.outputPathRelative.replace(/\\/g, "/");
    const outPath = resolve(siteOutDir, relativePath);
    await mkdir(dirname(outPath), { recursive: true });
    const resolveHref = makeHrefResolver(outPath);
    const styles = computeAssets(outPath, relativePath);
    await chartAssetManager.prepareContent(category.content);
    const pageDir = dirname(outPath);
    const getChartAssetHref = (chartData: ChartData, targetWidth: number) =>
      chartAssetManager.getAssetHref(chartData, pageDir, targetWidth);
    const html = renderCategoryPage(
      category,
      navIndex,
      config,
      styles.stylesheet,
      styles.additional,
      resolveHref,
      styles.resolveAssetHref,
      getChartAssetHref,
    );
    await writeFile(outPath, html, "utf8");
    categoryPages.push(relativePath);
  }

  for (const doc of navIndex.documents.values()) {
    const relativePath = doc.outputPathRelative.replace(/\\/g, "/");
    const outPath = resolve(siteOutDir, relativePath);
    await mkdir(dirname(outPath), { recursive: true });
    const resolveHref = makeHrefResolver(outPath);
    const styles = computeAssets(outPath, relativePath);
    await chartAssetManager.prepareContent(doc.content);
    const pageDir = dirname(outPath);
    const getChartAssetHref = (chartData: ChartData, targetWidth: number) =>
      chartAssetManager.getAssetHref(chartData, pageDir, targetWidth);
    const html = renderDocumentPage(
      doc,
      navIndex,
      config,
      styles.stylesheet,
      styles.additional,
      resolveHref,
      styles.resolveAssetHref,
      getChartAssetHref,
    );
    await writeFile(outPath, html, "utf8");
    docPages.push(relativePath);
  }

  const chartAssets = chartAssetManager.listAssets();
  const { mediaPaths } = await copyVersionAssets(
    entry,
    config,
    logger,
    assetsDir,
  );
  const staticStylesPath = relative(siteOutDir, assetsDir).replace(
    /\\/g,
    "/",
  );
  const manifest = {
    version: entry.version.version,
    generatedAt: new Date().toISOString(),
    index: "index.html",
    categories: Array.from(new Set(categoryPages)).sort(),
    docs: Array.from(new Set(docPages)).sort(),
    charts: Array.from(new Set(chartAssets)).sort(),
    media: Array.from(new Set(mediaPaths)).sort(),
    staticStylesPath,
    assetsManifest: `${staticStylesPath.replace(/\/$/, "")}/assets-manifest.json`,
  };
  await writeFile(
    resolve(siteOutDir, "static-manifest.json"),
    JSON.stringify(manifest, null, 2),
    "utf8",
  );

  logger.info(
    `Rendered static HTML for ${entry.version.version} -> ${resolve(
      siteOutDir,
    )}`,
  );
}
