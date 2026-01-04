import { useCallback, useEffect, useState } from "react";
import { documentationLoader } from "./documentationLoader";
import type {
  Category,
  DocItem,
  Product,
  Version,
} from "@shadow-shard-tools/docs-core";
import { clientConfig } from "../application/config/clientConfig";

interface LoadingState {
  versions: boolean;
  content: boolean;
}

interface ErrorState {
  versions?: string;
  content?: string;
}

export function useDocumentationData() {
  const productVersioning = clientConfig.PRODUCT_VERSIONING ?? false;

  const [products, setProducts] = useState<Product[]>([]);
  const [currentProduct, setCurrentProduct] = useState("");
  const [pendingProduct, setPendingProduct] = useState<string>();

  const [versions, setVersions] = useState<Version[]>([]);
  const [currentVersion, setCurrentVersion] = useState("");
  const [pendingVersion, setPendingVersion] = useState<string>();

  const [items, setItems] = useState<DocItem[]>([]);
  const [tree, setTree] = useState<Category[]>([]);
  const [standaloneDocs, setStandaloneDocs] = useState<DocItem[]>([]);

  const [loading, setLoading] = useState<LoadingState>({
    versions: true,
    content: true,
  });
  const [error, setError] = useState<ErrorState>({});
  const [hasLoadedInitial, setHasLoadedInitial] = useState(false);

  // Debug info state
  const [debugInfo, setDebugInfo] = useState<{
    baseUrl?: string;
    lastAttemptedVersion?: string;
    lastAttemptedProduct?: string;
    lastError?: Error;
  }>({});

  const PRODUCT_KEY = "docs:selectedProduct";
  const VERSION_KEY = "docs:selectedVersion";

  const readStored = useCallback(() => {
    if (typeof window === "undefined") {
      return { product: undefined, version: undefined };
    }
    try {
      const product = window.localStorage.getItem(PRODUCT_KEY) ?? undefined;
      const version = window.localStorage.getItem(VERSION_KEY) ?? undefined;
      return { product, version };
    } catch {
      return { product: undefined, version: undefined };
    }
  }, []);

  const writeStored = useCallback((product?: string, version?: string) => {
    if (typeof window === "undefined") return;
    try {
      if (product) window.localStorage.setItem(PRODUCT_KEY, product);
      if (version) window.localStorage.setItem(VERSION_KEY, version);
    } catch {
      // ignore storage errors
    }
  }, []);

  // Load products/versions/content whenever the requested selection changes
  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        console.log("Loading documentation data...");
        setLoading({ versions: true, content: true });
        setError({});
        setDebugInfo((prev) => ({
          ...prev,
          baseUrl: import.meta.env.BASE_URL,
          lastAttemptedVersion: pendingVersion,
          lastAttemptedProduct: pendingProduct,
        }));

        const data = await documentationLoader.loadVersionData({
          product: productVersioning ? pendingProduct : undefined,
          version: pendingVersion,
        });

        if (!isMounted) return;

        console.log("Content loaded successfully:", {
          product: data.product,
          version: data.version,
          itemsCount: data.items.length,
          treeCount: data.tree.length,
          standaloneDocsCount: data.standaloneDocs.length,
        });

        setProducts(data.products ?? []);
        setVersions(data.versions ?? []);
        setCurrentProduct(data.product ?? "");
        setCurrentVersion(data.version ?? "");
        setItems(data.items);
        setTree(data.tree);
        setStandaloneDocs(data.standaloneDocs ?? []);
        if (
          productVersioning &&
          pendingProduct &&
          data.product &&
          data.product !== pendingProduct
        ) {
          setPendingProduct(data.product);
        }
        if (pendingVersion && data.version && data.version !== pendingVersion) {
          setPendingVersion(data.version);
        }
        setHasLoadedInitial(true);
        setError({});
        setDebugInfo((prev) => ({
          ...prev,
          lastAttemptedVersion: data.version,
          lastAttemptedProduct: data.product,
          lastError: undefined,
        }));
      } catch (err) {
        console.error("Failed to load documentation data for selection:", err);

        if (!isMounted) return;

        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        const selectionDescription = [
          productVersioning
            ? `product ${pendingProduct || currentProduct || "(default)"}`
            : null,
          `version ${pendingVersion || currentVersion || "(default)"}`,
        ]
          .filter(Boolean)
          .join(" ");
        setError((prev) => ({
          ...prev,
          ...(hasLoadedInitial
            ? {
                content: `Failed to load documentation content for ${selectionDescription}: ${errorMessage}`,
              }
            : {
                versions: `Failed to load documentation metadata: ${errorMessage}`,
              }),
        }));
        setDebugInfo((prev) => ({ ...prev, lastError: err as Error }));
      } finally {
        if (isMounted) {
          setLoading({ versions: false, content: false });
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [productVersioning, pendingProduct, pendingVersion]);

  // Initialize from stored selection
  useEffect(() => {
    const stored = readStored();
    if (stored.product) setPendingProduct(stored.product);
    if (stored.version) setPendingVersion(stored.version);
  }, [readStored]);

  // Persist current selections
  useEffect(() => {
    if (currentProduct) writeStored(currentProduct, undefined);
  }, [currentProduct, writeStored]);

  useEffect(() => {
    if (currentProduct && currentVersion) writeStored(currentProduct, currentVersion);
  }, [currentProduct, currentVersion, writeStored]);

  // Helper function to retry loading content
  const retryLoadContent = useCallback(async () => {
    const productToUse = productVersioning
      ? (pendingProduct ?? currentProduct)
      : undefined;
    const versionToUse = pendingVersion ?? currentVersion;

    if (!versionToUse) return;

    console.log(
      `Retrying content load for ${productToUse ? `${productToUse} / ` : ""}${versionToUse}`,
    );
    setLoading((prev) => ({ ...prev, content: true }));
    setError((err) => ({ ...err, content: undefined }));

    try {
      const data = await documentationLoader.loadVersionData({
        product: productToUse,
        version: versionToUse,
      });
      setProducts(data.products ?? []);
      setVersions(data.versions ?? []);
      setCurrentProduct(data.product ?? "");
      setCurrentVersion(data.version ?? "");
      setItems(data.items);
      setTree(data.tree);
      setStandaloneDocs(data.standaloneDocs ?? []);
      if (
        productVersioning &&
        pendingProduct &&
        data.product &&
        data.product !== pendingProduct
      ) {
        setPendingProduct(data.product);
      }
      if (pendingVersion && data.version && data.version !== pendingVersion) {
        setPendingVersion(data.version);
      }
      setError({});
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError((prev) => ({
        ...prev,
        content: `Retry failed: ${errorMessage}`,
      }));
    } finally {
      setLoading((prev) => ({ ...prev, content: false }));
    }
  }, [
    currentProduct,
    currentVersion,
    pendingProduct,
    pendingVersion,
    productVersioning,
  ]);

  const handleProductChange = useCallback(
    (product: string) => {
      if (!productVersioning) return;

      setPendingProduct(product);
      setPendingVersion(undefined);
      setLoading({ versions: true, content: true });
      setError((prev) => ({
        ...prev,
        content: undefined,
        versions: undefined,
      }));
      setCurrentProduct(product);
      setCurrentVersion("");
      setVersions([]);
      setItems([]);
      setTree([]);
      setStandaloneDocs([]);
    },
    [productVersioning],
  );

  const handleVersionChange = useCallback((version: string) => {
    setPendingVersion(version);
    setLoading((prev) => ({ ...prev, content: true }));
    setError((prev) => ({ ...prev, content: undefined }));
    setCurrentVersion(version);
  }, []);

  // Helper function to get debug information
  const getDebugInfo = () => {
    return {
      ...debugInfo,
      currentState: {
        versionsLoaded: versions.length > 0,
        productsLoaded: products.length > 0,
        currentProduct,
        currentVersion,
        itemsLoaded: items.length,
        treeLoaded: tree.length,
        standaloneDocsLoaded: standaloneDocs.length,
        hasVersionError: !!error.versions,
        hasContentError: !!error.content,
        isLoadingVersions: loading.versions,
        isLoadingContent: loading.content,
      },
      environment: {
        baseUrl: import.meta.env.BASE_URL,
        mode: import.meta.env.MODE,
        dev: import.meta.env.DEV,
        productVersioning,
      },
    };
  };

  return {
    productVersioning,
    products,
    currentProduct,
    setCurrentProduct: handleProductChange,
    versions,
    currentVersion,
    setCurrentVersion: handleVersionChange,
    items,
    tree,
    standaloneDocs,
    loading,
    error,
    // Debug helpers
    retryLoadContent,
    getDebugInfo,
    debugInfo,
  } as const;
}
