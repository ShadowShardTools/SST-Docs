import type { Category } from "../types/Category.js";
import type { DataDiagnostic } from "../types/DataDiagnostic.js";
import type { DataProvider } from "../types/DataProvider.js";
import type { DocItem } from "../types/DocItem.js";
import type { IndexJson } from "../types/IndexJson.js";
import type { Logger } from "../types/Logger.js";
import type { Product } from "../types/Product.js";
import type { Version } from "../types/Version.js";
import { createLogger } from "../utilities/system/logger.js";

import { buildTree } from "./buildTree.js";
import { HttpDataProvider } from "./httpDataProvider.js";
import { loadAllCategories } from "./loadAllCategories.js";
import { loadAllItems } from "./loadAllItems.js";
import { loadProducts } from "./loadProducts.js";
import { loadVersions } from "./loadVersions.js";

export interface LoadVersionDataOptions {
  logger?: Logger;
}

export interface LoadVersionDataResult {
  items: DocItem[];
  tree: Category[];
  standaloneDocs: DocItem[];
  diagnostics: DataDiagnostic[];
}

export interface LoadVersionDataFromProviderOptions extends LoadVersionDataOptions {
  version?: string;
  product?: string;
  productVersioning?: boolean;
  tolerateMissing?: boolean;
  prefetch?: boolean;
}

export interface LoadVersionDataFromProviderResult extends LoadVersionDataResult {
  version: string;
  versions: Version[];
  product?: string;
  products?: Product[];
}

export async function loadVersionData(
  provider: DataProvider,
  versionRootAbs: string,
  options?: LoadVersionDataOptions,
): Promise<LoadVersionDataResult> {
  const logger = options?.logger;
  const diagnostics: DataDiagnostic[] = [];

  const index = await provider.readJson<IndexJson>(
    `${versionRootAbs}/index.json`,
  );

  const [categoriesResult, itemsResult] = await Promise.all([
    loadAllCategories(provider, versionRootAbs, index.categories, { logger }),
    loadAllItems(provider, versionRootAbs, index.items, { logger }),
  ]);

  const {
    tree,
    usedDocIds,
    diagnostics: treeDiagnostics,
  } = buildTree(categoriesResult.categories, itemsResult.items, { logger });

  const standaloneDocs = itemsResult.items.filter((d) => !usedDocIds.has(d.id));

  diagnostics.push(
    ...categoriesResult.diagnostics,
    ...itemsResult.diagnostics,
    ...treeDiagnostics,
  );

  return { items: itemsResult.items, tree, standaloneDocs, diagnostics };
}

export async function loadVersionDataFromProvider(
  provider: DataProvider,
  baseUrl: string,
  options?: LoadVersionDataFromProviderOptions,
  joinChild: JoinChildPath = joinUrl,
): Promise<LoadVersionDataFromProviderResult> {
  const logger =
    options?.logger ?? createLogger("data:loadVersionDataFromProvider");
  const root = trimTrailingSlash(baseUrl);
  const selection = await selectProductAndVersion(
    provider,
    root,
    options,
    logger,
    joinChild,
  );
  const versionRoot = joinChild(
    selection.versionsRoot,
    selection.selectedVersion,
  );
  const data = await loadVersionData(provider, versionRoot, { logger });

  if (options?.prefetch && selection.versions.length > 1) {
    prefetchOtherVersions(
      provider,
      selection.versionsRoot,
      selection.versions,
      selection.selectedVersion,
      joinChild,
      logger,
    );
  }

  return {
    version: selection.selectedVersion,
    versions: selection.versions,
    product: selection.product,
    products: selection.products,
    items: data.items,
    tree: data.tree,
    standaloneDocs: data.standaloneDocs,
    diagnostics: [...selection.diagnostics, ...data.diagnostics],
  };
}

/**
 * Proactively triggers background loads for other versions.
 */
function prefetchOtherVersions(
  provider: DataProvider,
  versionsRoot: string,
  versions: Version[],
  selectedVersion: string,
  joinChild: JoinChildPath,
  logger: Logger,
) {
  const others = versions.filter((v) => v.version !== selectedVersion);
  // Fire and forget, but handle errors to avoid unhandled rejections
  others.forEach((v) => {
    const vRoot = joinChild(versionsRoot, v.version);
    // Prefetch all items, categories, and index
    (async () => {
      try {
        logger.debug?.(`Prefetching version ${v.version}...`);
        // We only prefetch the bulk files as they are the most likely to be used and highly cached
        await Promise.allSettled([
          provider.readJson(`${vRoot}/index.json`),
          provider.readJson(`${vRoot}/items/_all.json`),
          provider.readJson(`${vRoot}/categories/_all.json`),
        ]);
      } catch {
        // Quietly fail prefetch
      }
    })();
  });
}

export async function loadVersionDataFromHttp(
  baseUrl: string,
  options?: LoadVersionDataFromProviderOptions,
): Promise<LoadVersionDataFromProviderResult> {
  return loadVersionDataFromProvider(new HttpDataProvider(), baseUrl, options);
}

export async function selectVersion(
  provider: DataProvider,
  root: string,
  requested: string | undefined,
  options: LoadVersionDataFromProviderOptions | undefined,
  logger: Logger,
): Promise<{
  versions: Version[];
  selectedVersion: string;
  diagnostics: DataDiagnostic[];
}> {
  const diagnostics: DataDiagnostic[] = [];
  const fallback = "current";
  let versions: Version[];

  try {
    versions = await loadVersions(provider, root);
  } catch (error) {
    if (!options?.tolerateMissing) {
      throw error;
    }

    const errorMessage = error instanceof Error ? error.message : String(error);
    const message = `Failed to load versions under ${root}: ${errorMessage}. Falling back to "${fallback}".`;
    diagnostics.push({
      code: "versions-read-failed",
      level: "warn",
      message,
      context: { root, error: errorMessage },
    });
    logger.warn(message);
    return {
      versions: [],
      selectedVersion: requested ?? fallback,
      diagnostics,
    };
  }

  if (versions.length === 0) {
    const message = `No versions found under ${root}. Falling back to "${fallback}".`;
    diagnostics.push({
      code: "no-versions-found",
      level: "warn",
      message,
      context: { root },
    });
    logger.warn(message);
    return { versions, selectedVersion: requested ?? fallback, diagnostics };
  }

  if (requested) {
    const match = versions.find((v) => v.version === requested);
    if (!match) {
      const message = `Requested version "${requested}" not found. Using first available: "${versions[0].version}".`;
      diagnostics.push({
        code: "version-not-found",
        level: "warn",
        message,
        context: { requested, available: versions.map((v) => v.version) },
      });
      logger.warn(message);
      return { versions, selectedVersion: versions[0].version, diagnostics };
    }
    return { versions, selectedVersion: requested, diagnostics };
  }

  return { versions, selectedVersion: versions[0].version, diagnostics };
}

type JoinChildPath = (base: string, child: string) => string;

export async function selectProductAndVersion(
  provider: DataProvider,
  root: string,
  options: LoadVersionDataFromProviderOptions | undefined,
  logger: Logger,
  joinChild: JoinChildPath,
): Promise<{
  product?: string;
  products?: Product[];
  versionsRoot: string;
  versions: Version[];
  selectedVersion: string;
  diagnostics: DataDiagnostic[];
}> {
  const diagnostics: DataDiagnostic[] = [];
  const productVersioning = options?.productVersioning ?? false;

  let versionsRoot = root;
  let product: string | undefined;
  let products: Product[] | undefined;

  if (productVersioning) {
    const productSelection = await selectProduct(
      provider,
      root,
      options?.product,
      options,
      logger,
    );
    diagnostics.push(...productSelection.diagnostics);
    products = productSelection.products;
    product = productSelection.selectedProduct;

    if (productSelection.selectedProduct) {
      versionsRoot = joinChild(root, productSelection.selectedProduct);
    }
  }

  const {
    versions,
    selectedVersion,
    diagnostics: versionDiagnostics,
  } = await selectVersion(
    provider,
    versionsRoot,
    options?.version,
    options,
    logger,
  );

  diagnostics.push(...versionDiagnostics);

  return {
    product,
    products,
    versionsRoot,
    versions,
    selectedVersion,
    diagnostics,
  };
}

async function selectProduct(
  provider: DataProvider,
  root: string,
  requested: string | undefined,
  options: LoadVersionDataFromProviderOptions | undefined,
  logger: Logger,
): Promise<{
  products: Product[];
  selectedProduct: string | undefined;
  diagnostics: DataDiagnostic[];
}> {
  const diagnostics: DataDiagnostic[] = [];
  let products: Product[];

  try {
    products = await loadProducts(provider, root);
  } catch (error) {
    if (!options?.tolerateMissing) {
      throw error;
    }

    const errorMessage = error instanceof Error ? error.message : String(error);
    const message = `Failed to load products under ${root}: ${errorMessage}.`;
    diagnostics.push({
      code: "products-read-failed",
      level: "warn",
      message,
      context: { root, error: errorMessage },
    });
    logger.warn(message);
    return { products: [], selectedProduct: undefined, diagnostics };
  }

  if (products.length === 0) {
    const message = `No products found under ${root}.`;
    diagnostics.push({
      code: "no-products-found",
      level: "warn",
      message,
      context: { root },
    });
    logger.warn(message);
    return { products, selectedProduct: undefined, diagnostics };
  }

  if (requested) {
    const match = products.find((p) => p.product === requested);
    if (!match) {
      const message = `Requested product "${requested}" not found. Using first available: "${products[0].product}".`;
      diagnostics.push({
        code: "product-not-found",
        level: "warn",
        message,
        context: { requested, available: products.map((p) => p.product) },
      });
      logger.warn(message);
      return { products, selectedProduct: products[0].product, diagnostics };
    }

    return { products, selectedProduct: requested, diagnostics };
  }

  return { products, selectedProduct: products[0].product, diagnostics };
}

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

function joinUrl(base: string, child: string): string {
  return `${trimTrailingSlash(base)}/${child.replace(/^\/+/, "")}`;
}
