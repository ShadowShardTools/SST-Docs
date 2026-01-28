import { useCallback, useEffect, useRef, useState } from "react";
import { clientConfig } from "../application/config/clientConfig";
import {
  useVersionedDocumentationLoader,
  type LoadState,
} from "./useVersionedDocumentationLoader";

interface LoadingState {
  versions: boolean;
  content: boolean;
}

interface ErrorState {
  versions?: string;
  content?: string;
}

interface UseDocumentationDataOptions {
  initialSelection?: { product?: string; version?: string };
}

export function useDocumentationData(
  options: UseDocumentationDataOptions = {},
) {
  const { initialSelection } = options;
  const productVersioning = clientConfig.PRODUCT_VERSIONING ?? false;

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

  const {
    products,
    versions,
    currentProduct,
    currentVersion,
    items,
    tree,
    standaloneDocs,
    selectedProduct,
    selectedVersion,
    setSelectedProduct,
    setSelectedVersion,
    setCurrentProduct,
    setCurrentVersion,
    status,
    error: loadError,
    reload,
    resetContent,
    resetVersions,
  } = useVersionedDocumentationLoader({
    storageKeyPrefix: "docs",
    productVersioning,
    initialSelection,
    autoLoad: true,
    clearOnLoad: false,
    syncSelection: true,
  });

  const prevStatusRef = useRef<LoadState>("idle");
  const loadErrorRef = useRef<string | null>(null);

  useEffect(() => {
    loadErrorRef.current = loadError;
  }, [loadError]);

  const describeSelection = useCallback(() => {
    const productLabel = productVersioning
      ? selectedProduct || currentProduct || "(default)"
      : null;
    const versionLabel = selectedVersion || currentVersion || "(default)";
    return [
      productLabel ? `product ${productLabel}` : null,
      `version ${versionLabel}`,
    ]
      .filter(Boolean)
      .join(" ");
  }, [
    currentProduct,
    currentVersion,
    productVersioning,
    selectedProduct,
    selectedVersion,
  ]);

  useEffect(() => {
    const previousStatus = prevStatusRef.current;

    if (status === "loading") {
      console.log("Loading documentation data...");
      setLoading({ versions: true, content: true });
      setError({});
      setDebugInfo((prev) => ({
        ...prev,
        baseUrl: import.meta.env.BASE_URL,
        lastAttemptedVersion: selectedVersion,
        lastAttemptedProduct: productVersioning ? selectedProduct : undefined,
      }));
    }

    if (status === "idle" && previousStatus === "loading") {
      console.log("Content loaded successfully:", {
        product: currentProduct,
        version: currentVersion,
        itemsCount: items.length,
        treeCount: tree.length,
        standaloneDocsCount: standaloneDocs.length,
      });
      setLoading({ versions: false, content: false });
      setHasLoadedInitial(true);
      setError({});
      setDebugInfo((prev) => ({
        ...prev,
        lastAttemptedVersion: currentVersion,
        lastAttemptedProduct: currentProduct,
        lastError: undefined,
      }));
    }

    if (status === "error" && loadError && previousStatus !== "error") {
      console.error(
        "Failed to load documentation data for selection:",
        loadError,
      );
      setLoading({ versions: false, content: false });
      const selectionDescription = describeSelection();
      setError((prev) => ({
        ...prev,
        ...(hasLoadedInitial
          ? {
              content: `Failed to load documentation content for ${selectionDescription}: ${loadError}`,
            }
          : {
              versions: `Failed to load documentation metadata: ${loadError}`,
            }),
      }));
      setDebugInfo((prev) => ({ ...prev, lastError: new Error(loadError) }));
    }

    prevStatusRef.current = status;
  }, [
    currentProduct,
    currentVersion,
    describeSelection,
    hasLoadedInitial,
    items.length,
    loadError,
    productVersioning,
    selectedProduct,
    selectedVersion,
    standaloneDocs.length,
    status,
    tree.length,
  ]);

  // Helper function to retry loading content
  const retryLoadContent = useCallback(async () => {
    const productToUse = productVersioning
      ? (selectedProduct ?? currentProduct)
      : undefined;
    const versionToUse = selectedVersion ?? currentVersion;

    if (!versionToUse) return;

    console.log(
      `Retrying content load for ${productToUse ? `${productToUse} / ` : ""}${versionToUse}`,
    );
    setLoading((prev) => ({ ...prev, content: true }));
    setError((err) => ({ ...err, content: undefined }));

    const ok = await reload(productToUse, versionToUse);
    if (!ok) {
      const message = loadErrorRef.current ?? "Unknown error";
      setError((prev) => ({
        ...prev,
        content: `Retry failed: ${message}`,
      }));
    }

    setLoading((prev) => ({ ...prev, content: false }));
  }, [
    currentProduct,
    currentVersion,
    productVersioning,
    reload,
    selectedProduct,
    selectedVersion,
  ]);

  const handleProductChange = useCallback(
    (product: string) => {
      if (!productVersioning) return;

      setSelectedProduct(product);
      setSelectedVersion(undefined);
      setLoading({ versions: true, content: true });
      setError((prev) => ({
        ...prev,
        content: undefined,
        versions: undefined,
      }));
      setCurrentProduct(product);
      setCurrentVersion("");
      resetVersions();
      resetContent();
    },
    [
      productVersioning,
      resetContent,
      resetVersions,
      setCurrentProduct,
      setCurrentVersion,
      setSelectedProduct,
      setSelectedVersion,
    ],
  );

  const handleVersionChange = useCallback(
    (version: string) => {
      setSelectedVersion(version);
      setLoading((prev) => ({ ...prev, content: true }));
      setError((prev) => ({ ...prev, content: undefined }));
      setCurrentVersion(version);
    },
    [setCurrentVersion, setSelectedVersion],
  );

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
