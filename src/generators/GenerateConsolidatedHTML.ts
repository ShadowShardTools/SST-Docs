import "dotenv/config";

import fs from "node:fs/promises";
import path from "node:path";
import appRoot from "app-root-path";
import {
  buildTree,
  createLogger,
  loadSstDocsConfigSync,
  resolveDataPath,
  type DocItem,
  type HtmlGeneratorSettings,
} from "@shadow-shard-tools/docs-core";
import {
  ALIGNMENT_CLASSES,
  SPACING_CLASSES,
} from "@shadow-shard-tools/docs-core";
import { defaultTheme } from "@shadow-shard-tools/docs-core/themes";
import type { StyleTheme } from "@shadow-shard-tools/docs-core/types";
import { compile } from "tailwindcss";
import { generateConsolidatedHTML } from "./htmlGenerator/index.js";

const logger = createLogger("generate-consolidated-html");
const projectRoot = appRoot.path;

interface GeneratorConfig {
  OUTPUT_DIRECTORY: string;
  PAGE_SIZE: "A4" | "Letter";
  PAGE_PADDINGS: [number, number, number, number];
  INCLUDE_TOC: boolean;
  THEME: StyleTheme;
  PRODUCT_VERSIONING: boolean;
  BRANDING_NAME: string;
}

function readConfig(config = loadSstDocsConfigSync()): GeneratorConfig {
  const generator: Partial<HtmlGeneratorSettings> =
    config.HTML_GENERATOR_SETTINGS ?? {};
  const brandingName =
    config.HEADER_BRANDING?.logoText ??
    config.HEADER_BRANDING?.logoAlt ??
    "Documentation";

  return {
    OUTPUT_DIRECTORY: generator.OUTPUT_DIRECTORY ?? "./public/SST-Docs/data",
    PAGE_SIZE:
      generator.PAGE_SIZE === "Letter" || generator.PAGE_SIZE === "A4"
        ? generator.PAGE_SIZE
        : "A4",
    PAGE_PADDINGS: generator.PAGE_PADDINGS ?? [20, 20, 20, 20],
    INCLUDE_TOC: generator.INCLUDE_TOC ?? true,
    THEME: generator.THEME ?? defaultTheme,
    PRODUCT_VERSIONING: config.PRODUCT_VERSIONING,
    BRANDING_NAME: brandingName,
  };
}

const TEMPLATE_FILES = [
  path.join(
    appRoot.path,
    "src",
    "generators",
    "htmlGenerator",
    "templates",
    "document.ts",
  ),
  path.join(
    appRoot.path,
    "src",
    "generators",
    "htmlGenerator",
    "templates",
    "blocks.ts",
  ),
];

const DOCS_CORE_GLOB = path.join(
  appRoot.path,
  "node_modules",
  "@shadow-shard-tools",
  "docs-core",
  "dist",
);
const STATIC_TEMPLATE_FILES = [
  path.join(
    appRoot.path,
    "src",
    "generators",
    "htmlGenerator",
    "templates",
    "static-code-block.css",
  ),
  path.join(
    appRoot.path,
    "src",
    "generators",
    "htmlGenerator",
    "templates",
    "static-compare.css",
  ),
];

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await fs.stat(targetPath);
    return true;
  } catch {
    return false;
  }
}

function extractThemeClasses(theme: StyleTheme): string[] {
  const classes: string[] = [];
  const visit = (value: unknown) => {
    if (typeof value === "string") {
      classes.push(value);
      return;
    }
    if (!value || typeof value !== "object") return;
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }
    Object.values(value as Record<string, unknown>).forEach(visit);
  };
  visit(theme);
  return classes;
}

function extractClassesFromSource(source: string): string[] {
  const matches: string[] = [];
  const classRegex = /class(?:Name)?=["']([^"']+)["']/g;
  let match: RegExpExecArray | null;
  while ((match = classRegex.exec(source))) {
    const cleaned = match[1].replace(/\$\{[^}]+\}/g, " ");
    matches.push(cleaned);
  }
  return matches;
}

function extractClassTokensFromStrings(source: string): string[] {
  const tokens: string[] = [];
  const stringRegex = /(["'`])((?:\\.|(?!\1)[\s\S])*)\1/g;
  let match: RegExpExecArray | null;
  while ((match = stringRegex.exec(source))) {
    const raw = match[2];
    const cleaned = raw.replace(/\$\{[^}]+\}/g, " ");
    cleaned
      .split(/\s+/)
      .map((entry) => entry.trim())
      .filter(Boolean)
      .forEach((entry) => tokens.push(entry));
  }
  return tokens;
}

function isLikelyTailwindClass(token: string): boolean {
  if (!token) return false;
  if (token.length < 2) return false;
  if (token.includes("<") || token.includes(">")) return false;
  if (token.startsWith("http")) return false;
  return /^[a-zA-Z][a-zA-Z0-9\-\:\.\[\]\/_%!]+$/.test(token);
}

function extractConstantClasses(): string[] {
  const classes: string[] = [];
  const push = (value: string | undefined) => {
    if (!value) return;
    value
      .split(/\s+/)
      .map((entry) => entry.trim())
      .filter(Boolean)
      .forEach((entry) => classes.push(entry));
  };

  Object.values(ALIGNMENT_CLASSES).forEach((entry) => {
    push(entry.text);
    push(entry.container);
  });

  Object.values(SPACING_CLASSES).forEach((entry) => {
    push(entry);
  });

  return classes;
}

async function collectTailwindCandidates(
  theme: StyleTheme,
): Promise<Set<string>> {
  const candidates = new Set<string>();
  const addClasses = (value: string) => {
    value
      .split(/\s+/)
      .map((entry) => entry.trim())
      .filter(Boolean)
      .forEach((entry) => candidates.add(entry));
  };

  extractThemeClasses(theme).forEach(addClasses);
  extractConstantClasses().forEach(addClasses);

  const templateFiles = TEMPLATE_FILES;
  for (const filePath of templateFiles) {
    if (!(await pathExists(filePath))) continue;
    const source = await fs.readFile(filePath, "utf8");
    extractClassesFromSource(source).forEach(addClasses);
    extractClassTokensFromStrings(source)
      .filter(isLikelyTailwindClass)
      .forEach(addClasses);
  }

  if (await pathExists(DOCS_CORE_GLOB)) {
    const stack = [DOCS_CORE_GLOB];
    while (stack.length) {
      const current = stack.pop();
      if (!current) continue;
      const entries = await fs.readdir(current, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(current, entry.name);
        if (entry.isDirectory()) {
          stack.push(fullPath);
          continue;
        }
        if (!fullPath.endsWith(".js") && !fullPath.endsWith(".mjs")) {
          continue;
        }
        const source = await fs.readFile(fullPath, "utf8");
        extractClassesFromSource(source).forEach(addClasses);
        extractClassTokensFromStrings(source)
          .filter(isLikelyTailwindClass)
          .forEach(addClasses);
      }
    }
  }

  const baseCandidates = Array.from(candidates);
  baseCandidates.forEach((entry) => {
    if (!entry || entry.includes(":")) return;
    candidates.add(`dark:${entry}`);
  });
  candidates.add("dark");
  candidates.add("light");

  return candidates;
}

async function copyKatexFonts(targetRoot: string): Promise<void> {
  const fontsSource = path.join(
    appRoot.path,
    "node_modules",
    "katex",
    "dist",
    "fonts",
  );
  const fontsTarget = path.join(targetRoot, "fonts");
  if (!(await pathExists(fontsSource))) return;
  await fs.mkdir(fontsTarget, { recursive: true });
  await fs.cp(fontsSource, fontsTarget, { recursive: true, force: true });
}

async function writeAssetsManifest(root: string): Promise<void> {
  const files: string[] = [];
  const walk = async (dir: string, prefix = "") => {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath, relative);
      } else if (relative !== "assets-manifest.json") {
        files.push(relative.replace(/\\/g, "/"));
      }
    }
  };

  await walk(root);
  await fs.writeFile(
    path.join(root, "assets-manifest.json"),
    JSON.stringify(files.sort(), null, 2),
    "utf8",
  );
}

async function ensureStaticStyles(
  dataRoot: string,
  theme: StyleTheme,
): Promise<void> {
  const targetRoot = path.join(dataRoot, "static-styles");
  await fs.mkdir(targetRoot, { recursive: true });

  const candidates = await collectTailwindCandidates(theme);
  const tailwindIndexPath = path.join(
    appRoot.path,
    "node_modules",
    "tailwindcss",
    "index.css",
  );
  const tailwindIndexCss = (await pathExists(tailwindIndexPath))
    ? await fs.readFile(tailwindIndexPath, "utf8")
    : "@tailwind theme; @tailwind base; @tailwind utilities;";
  const inputCss = `@custom-variant dark (&:where(.dark, .dark *));
${tailwindIndexCss}`;
  const compiler = await compile(inputCss, { from: "generator.css" });
  const tailwindCss = compiler.build(Array.from(candidates));
  const katexCssPath = path.join(
    appRoot.path,
    "node_modules",
    "katex",
    "dist",
    "katex.min.css",
  );
  const katexCss = (await pathExists(katexCssPath))
    ? await fs.readFile(katexCssPath, "utf8")
    : "";
  const prismSource = path.join(
    appRoot.path,
    "node_modules",
    "prismjs",
    "themes",
    "prism-tomorrow.css",
  );
  const prismCss = (await pathExists(prismSource))
    ? await fs.readFile(prismSource, "utf8")
    : "";

  await fs.writeFile(
    path.join(targetRoot, "site.css"),
    `${tailwindCss}\n${katexCss}\n${prismCss}`,
    "utf8",
  );

  for (const templatePath of STATIC_TEMPLATE_FILES) {
    if (!(await pathExists(templatePath))) continue;
    const filename = path.basename(templatePath);
    await fs.copyFile(templatePath, path.join(targetRoot, filename));
  }

  const vendorDir = path.join(targetRoot, "vendor");
  await fs.mkdir(vendorDir, { recursive: true });

  if (await pathExists(prismSource)) {
    await fs.copyFile(prismSource, path.join(targetRoot, "prism-tomorrow.css"));
  }
  const prismScriptSource = path.join(
    appRoot.path,
    "node_modules",
    "prismjs",
    "prism.js",
  );
  if (await pathExists(prismScriptSource)) {
    await fs.copyFile(prismScriptSource, path.join(vendorDir, "prism.js"));
  }

  const chartScriptSource = path.join(
    appRoot.path,
    "node_modules",
    "chart.js",
    "dist",
    "chart.umd.js",
  );
  if (await pathExists(chartScriptSource)) {
    await fs.copyFile(chartScriptSource, path.join(vendorDir, "chart.umd.js"));
  }

  const splideScriptSource = path.join(
    appRoot.path,
    "node_modules",
    "@splidejs",
    "splide",
    "dist",
    "js",
    "splide.min.js",
  );
  if (await pathExists(splideScriptSource)) {
    await fs.copyFile(
      splideScriptSource,
      path.join(vendorDir, "splide.min.js"),
    );
  }
  const splideCssSource = path.join(
    appRoot.path,
    "node_modules",
    "@splidejs",
    "splide",
    "dist",
    "css",
    "splide.min.css",
  );
  if (await pathExists(splideCssSource)) {
    await fs.copyFile(splideCssSource, path.join(targetRoot, "splide.min.css"));
  }

  await copyKatexFonts(targetRoot);
  await writeAssetsManifest(targetRoot);
  logger.info(`Generated static-styles at ${targetRoot}`);
}

async function writeStaticManifest(
  versionRoot: string,
  payload: {
    versionId: string;
    versionLabel: string;
    productId: string;
    productLabel: string;
    staticStylesPath: string;
    mediaPaths: string[];
    chartPaths: string[];
  },
): Promise<void> {
  const manifest = {
    version: payload.versionId,
    versionLabel: payload.versionLabel,
    versionData: {
      version: payload.versionId,
      label: payload.versionLabel,
    },
    product: payload.productId,
    productLabel: payload.productLabel,
    productData: {
      product: payload.productId,
      label: payload.productLabel,
    },
    generatedAt: new Date().toISOString(),
    index: "index.html",
    categories: [] as string[],
    docs: [] as string[],
    charts: payload.chartPaths,
    media: payload.mediaPaths,
    staticStylesPath: payload.staticStylesPath,
    assetsManifest: path.posix.join(
      payload.staticStylesPath.replace(/\/+$/, ""),
      "assets-manifest.json",
    ),
  };

  try {
    await fs.writeFile(
      path.join(versionRoot, "static-manifest.json"),
      JSON.stringify(manifest, null, 2),
      "utf-8",
    );
    logger.info(
      `Generated static-manifest.json at ${path.relative(projectRoot, versionRoot)}`,
    );
  } catch (error) {
    logger.warn(
      `Failed to write static-manifest.json for ${versionRoot}: ${error}`,
    );
  }
}

function collectMediaPathsFromValue(
  value: unknown,
  paths: Set<string>,
  versionMarker: string,
): void {
  if (!value) return;
  if (typeof value === "string") {
    const cleaned = value.trim();
    if (!cleaned) return;
    const normalized = cleaned.replace(/\\/g, "/");
    const markerIndex = normalized.indexOf(versionMarker);
    if (markerIndex !== -1) {
      const relative = normalized.slice(markerIndex + versionMarker.length);
      const trimmed = relative.replace(/^\/+/, "");
      if (trimmed) paths.add(trimmed);
    }
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((entry) =>
      collectMediaPathsFromValue(entry, paths, versionMarker),
    );
    return;
  }
  if (typeof value === "object") {
    Object.values(value as Record<string, unknown>).forEach((entry) =>
      collectMediaPathsFromValue(entry, paths, versionMarker),
    );
  }
}

async function collectMediaPaths(
  versionPath: string,
  orderedItems: DocItem[],
  productId: string,
  versionId: string,
): Promise<string[]> {
  const paths = new Set<string>();
  const versionMarker = `/${productId}/${versionId}/`;

  orderedItems.forEach((item) =>
    collectMediaPathsFromValue(item.content, paths, versionMarker),
  );

  const categoriesDir = path.join(versionPath, "categories");
  if (await pathExists(categoriesDir)) {
    const entries = await fs.readdir(categoriesDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.endsWith(".json")) continue;
      const catPath = path.join(categoriesDir, entry.name);
      const catData = await fs.readFile(catPath, "utf8");
      collectMediaPathsFromValue(JSON.parse(catData), paths, versionMarker);
    }
  }

  const mediaDirs = ["images", "audio", "media", "video"];
  for (const dirName of mediaDirs) {
    const dirPath = path.join(versionPath, dirName);
    if (!(await pathExists(dirPath))) continue;
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isFile() || entry.name.startsWith(".")) continue;
      const relative = `${dirName}/${entry.name}`.replace(/\\/g, "/");
      paths.add(relative);
    }
  }

  return Array.from(paths).sort();
}

async function readDocItem(
  itemsDir: string,
  itemId: string,
): Promise<DocItem | null> {
  try {
    const itemPath = path.join(itemsDir, `${itemId}.json`);
    const itemData = await fs.readFile(itemPath, "utf-8");
    return JSON.parse(itemData) as DocItem;
  } catch (e) {
    logger.warn(`Failed to read item ${itemId}: ${e}`);
    return null;
  }
}

async function loadCategoriesMap(
  categoriesDir: string,
): Promise<Record<string, any>> {
  const map: Record<string, any> = {};
  if (!(await pathExists(categoriesDir))) return map;
  const entries = await fs.readdir(categoriesDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".json")) continue;
    const catPath = path.join(categoriesDir, entry.name);
    try {
      const catData = await fs.readFile(catPath, "utf-8");
      const category = JSON.parse(catData);
      if (category?.id) {
        map[category.id] = category;
      }
    } catch (e) {
      logger.warn(`Failed to read category file ${entry.name}: ${e}`);
    }
  }
  return map;
}

type TocEntry = { id: string; title: string; indent: number };
type ItemMeta = { breadcrumb: string[]; isCategory: boolean };

function flattenTreeToItems(tree: any[]): {
  items: DocItem[];
  toc: TocEntry[];
  meta: Record<string, ItemMeta>;
  categoryIndex: Record<string, { children: string[]; docs: string[] }>;
} {
  const items: DocItem[] = [];
  const toc: TocEntry[] = [];
  const meta: Record<string, ItemMeta> = {};
  const categoryIndex: Record<string, { children: string[]; docs: string[] }> =
    {};
  const visit = (node: any, depth: number, trail: string[]) => {
    if (!node) return;
    const categoryId = `category-${node.id}`;
    const title = node.title ?? "Category";
    const categoryTrail = [...trail, title];
    items.push({
      id: categoryId,
      title,
      description: node.description ?? "",
      content: node.content ?? [],
    });
    toc.push({ id: categoryId, title, indent: depth });
    meta[categoryId] = { breadcrumb: categoryTrail, isCategory: true };
    categoryIndex[categoryId] = {
      children: Array.isArray(node.children)
        ? node.children.map((child: any) => `category-${child.id}`)
        : [],
      docs: Array.isArray(node.docs)
        ? node.docs.map((doc: DocItem) => doc.id)
        : [],
    };
    if (Array.isArray(node.docs)) {
      node.docs.forEach((doc: DocItem) => {
        if (!doc) return;
        items.push(doc);
        toc.push({ id: doc.id, title: doc.title, indent: depth + 1 });
        meta[doc.id] = {
          breadcrumb: [...categoryTrail, doc.title],
          isCategory: false,
        };
      });
    }
    if (Array.isArray(node.children)) {
      node.children.forEach((child: any) =>
        visit(child, depth + 1, categoryTrail),
      );
    }
  };
  tree.forEach((root) => visit(root, 0, []));
  return { items, toc, meta, categoryIndex };
}

async function traverseTree(
  categoriesDir: string,
  itemsDir: string,
  node: any,
  seenCategories: Set<string>,
  seenItems: Set<string>,
): Promise<{
  items: DocItem[];
  toc: TocEntry[];
  meta: Record<string, ItemMeta>;
  categoryIndex: Record<string, { children: string[]; docs: string[] }>;
}> {
  void seenCategories;
  const items: DocItem[] = [];
  const toc: TocEntry[] = [];
  const meta: Record<string, ItemMeta> = {};
  const categoryIndex: Record<string, { children: string[]; docs: string[] }> =
    {};

  const itemIds: string[] = node.items || node.docs || [];
  const allDocs: DocItem[] = [];
  for (const itemId of itemIds) {
    const doc = await readDocItem(itemsDir, itemId);
    if (doc) {
      allDocs.push(doc);
      seenItems.add(itemId);
    }
  }

  const rawMap = await loadCategoriesMap(categoriesDir);
  const { tree, usedDocIds } = buildTree(rawMap, allDocs, { logger });

  const indexCategoryIds: string[] = node.categories || [];
  const categoryNodes = tree.filter((category: any) =>
    indexCategoryIds.includes(category.id),
  );

  usedDocIds.forEach((id: string) => {
    seenItems.add(id);
  });

  const remainingDocs = allDocs.filter((doc) => !usedDocIds.has(doc.id));
  remainingDocs.forEach((doc) => {
    items.push(doc);
    toc.push({ id: doc.id, title: doc.title, indent: 0 });
    meta[doc.id] = { breadcrumb: [doc.title], isCategory: false };
  });

  const flattened = flattenTreeToItems(categoryNodes);
  items.push(...flattened.items);
  toc.push(...flattened.toc);
  Object.assign(meta, flattened.meta);
  Object.assign(categoryIndex, flattened.categoryIndex);

  return { items, toc, meta, categoryIndex };
}

async function main(): Promise<void> {
  const config = loadSstDocsConfigSync();
  const dataRoot = resolveDataPath(config.FS_DATA_PATH);
  const generatorConfig = await readConfig(config);
  const theme = generatorConfig.THEME;
  await ensureStaticStyles(dataRoot, theme);

  logger.info("Starting Consolidated PDF-style HTML generation");

  const productsPath = path.join(dataRoot, "products.json");
  const productsExists = await pathExists(productsPath);

  const runVersion = async (payload: {
    productId: string;
    productLabel: string;
    versionId: string;
    versionLabel: string;
    versionPath: string;
  }) => {
    const { productId, productLabel, versionId, versionLabel, versionPath } =
      payload;
    const indexPath = path.join(versionPath, "index.json");
    const categoriesDir = path.join(versionPath, "categories");
    const itemsDir = path.join(versionPath, "items");

    const indexData = await fs.readFile(indexPath, "utf-8");
    const index = JSON.parse(indexData);

    logger.info(`Collecting items for ${productLabel} v${versionId}...`);
    const treeResult = await traverseTree(
      categoriesDir,
      itemsDir,
      index,
      new Set<string>(),
      new Set<string>(),
    );

    const orderedItems = treeResult.items;
    const tocEntries = treeResult.toc;
    const itemMeta = treeResult.meta;
    const categoryIndex = treeResult.categoryIndex;

    if (orderedItems.length === 0) {
      logger.warn(
        `No items found for ${productLabel} v${versionId}, skipping.`,
      );
      return;
    }

    const staticStylesPath = path.join(dataRoot, "static-styles");
    let staticStylesRelative = path
      .relative(versionPath, staticStylesPath)
      .replace(/\\/g, "/");
    if (!staticStylesRelative.startsWith(".")) {
      staticStylesRelative = `./${staticStylesRelative}`;
    }

    const html = generateConsolidatedHTML(orderedItems, {
      product: productLabel,
      version: versionLabel ?? versionId,
      productId,
      versionId,
      tocEntries,
      itemMeta,
      categoryIndex,
      pageSize: generatorConfig.PAGE_SIZE,
      pagePaddings: generatorConfig.PAGE_PADDINGS,
      includeTOC: generatorConfig.INCLUDE_TOC,
      theme: generatorConfig.THEME,
      staticStylesBase: staticStylesRelative,
    });

    const mediaPaths = await collectMediaPaths(
      versionPath,
      orderedItems,
      productId,
      versionId,
    );
    const outputFile = path.join(versionPath, "index.html");
    await fs.writeFile(outputFile, html, "utf-8");
    await writeStaticManifest(versionPath, {
      versionId,
      versionLabel: versionLabel ?? versionId,
      productId,
      productLabel,
      staticStylesPath: staticStylesRelative,
      mediaPaths,
      chartPaths: [],
    });
    logger.info(
      `✓ Generated: ${productId}/${versionId}/index.html (${orderedItems.length} items)`,
    );
  };

  if (generatorConfig.PRODUCT_VERSIONING && productsExists) {
    const productsData = await fs.readFile(productsPath, "utf-8");
    const products = JSON.parse(productsData) as Array<{
      product: string;
      label: string;
    }>;

    for (const { product, label } of products) {
      const productPath = path.join(dataRoot, product);
      const versionsPath = path.join(productPath, "versions.json");

      try {
        const versionsData = await fs.readFile(versionsPath, "utf-8");
        const versions = JSON.parse(versionsData) as Array<{
          version: string;
          label: string;
        }>;

        for (const { version, label: versionLabel } of versions) {
          try {
            const versionPath = path.join(productPath, version);
            await runVersion({
              productId: product,
              productLabel: label,
              versionId: version,
              versionLabel,
              versionPath,
            });
          } catch (versionError) {
            logger.warn(
              `Failed version ${product}/${version}: ${versionError}`,
            );
          }
        }
      } catch (e) {
        logger.warn(`Skipping product ${product}: ${e}`);
      }
    }
  } else {
    const indexAtRoot = await pathExists(path.join(dataRoot, "index.json"));
    if (indexAtRoot) {
      await runVersion({
        productId: "default",
        productLabel: generatorConfig.BRANDING_NAME,
        versionId: "current",
        versionLabel: "current",
        versionPath: dataRoot,
      });
    } else {
      const versionsPath = path.join(dataRoot, "versions.json");
      if (await pathExists(versionsPath)) {
        const versionsData = await fs.readFile(versionsPath, "utf-8");
        const versions = JSON.parse(versionsData) as Array<{
          version: string;
          label: string;
        }>;
        for (const { version, label: versionLabel } of versions) {
          const versionPath = path.join(dataRoot, version);
          if (!(await pathExists(path.join(versionPath, "index.json")))) {
            logger.warn(
              `Skipping version ${version} (no index.json found at ${versionPath})`,
            );
            continue;
          }
          await runVersion({
            productId: "default",
            productLabel: generatorConfig.BRANDING_NAME,
            versionId: version,
            versionLabel,
            versionPath,
          });
        }
      } else {
        logger.warn(
          "No products.json or versions.json found, and index.json not present at data root. Nothing to generate.",
        );
      }
    }
  }
}

main().catch((error) => {
  logger.error?.(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
