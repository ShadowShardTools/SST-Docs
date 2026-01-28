import { useCallback, useEffect, useRef, useState } from "react";
import type {
  Category,
  DocItem,
  Product,
  Version,
} from "@shadow-shard-tools/docs-core";
import { documentationLoader } from "./documentationLoader";

export type LoadState = "idle" | "loading" | "error";

type Selection = { product?: string; version?: string };

interface UseVersionedDocumentationLoaderOptions {
  storageKeyPrefix: string;
  productVersioning: boolean;
  source?: "editor" | "http";
  autoLoad?: boolean;
  clearOnLoad?: boolean;
  syncSelection?: boolean;
  initialSelection?: Selection;
}

const normalizeStoredValue = (value: string | null) =>
  value && value.length > 0 ? value : undefined;

const normalizeSelectionValue = (value?: string | null) =>
  value && value.length > 0 ? value : undefined;

export function useVersionedDocumentationLoader({
  storageKeyPrefix,
  productVersioning,
  source,
  autoLoad = true,
  clearOnLoad = false,
  syncSelection = false,
  initialSelection: initialSelectionOverride,
}: UseVersionedDocumentationLoaderOptions) {
  const productKey = `${storageKeyPrefix}:selectedProduct`;
  const versionKey = `${storageKeyPrefix}:selectedVersion`;

  const readStoredSelection = useCallback((): Selection => {
    if (typeof window === "undefined") {
      return { product: undefined, version: undefined };
    }
    try {
      const product = normalizeStoredValue(
        window.localStorage.getItem(productKey),
      );
      const version = normalizeStoredValue(
        window.localStorage.getItem(versionKey),
      );
      return productVersioning
        ? { product, version }
        : { product: undefined, version };
    } catch {
      return { product: undefined, version: undefined };
    }
  }, [productKey, productVersioning, versionKey]);

  const readInitialSelection = useCallback((): Selection => {
    if (initialSelectionOverride) {
      const product = normalizeSelectionValue(initialSelectionOverride.product);
      const version = normalizeSelectionValue(initialSelectionOverride.version);
      if (product || version) {
        return productVersioning
          ? { product, version }
          : { product: undefined, version };
      }
    }
    return readStoredSelection();
  }, [initialSelectionOverride, productVersioning, readStoredSelection]);

  const initialSelectionRef = useRef<Selection | null>(null);
  if (!initialSelectionRef.current) {
    initialSelectionRef.current = readInitialSelection();
  }
  const initialSelection = initialSelectionRef.current ?? {
    product: undefined,
    version: undefined,
  };
  const initialProduct = initialSelection.product;
  const initialVersion = initialSelection.version;

  const [selectedProduct, setSelectedProduct] = useState<string | undefined>(
    initialSelection.product,
  );
  const [selectedVersion, setSelectedVersion] = useState<string | undefined>(
    initialSelection.version,
  );

  const [products, setProducts] = useState<Product[]>([]);
  const [versions, setVersions] = useState<Version[]>([]);
  const [currentProduct, setCurrentProduct] = useState("");
  const [currentVersion, setCurrentVersion] = useState("");

  const [items, setItems] = useState<DocItem[]>([]);
  const [tree, setTree] = useState<Category[]>([]);
  const [standaloneDocs, setStandaloneDocs] = useState<DocItem[]>([]);

  const [status, setStatus] = useState<LoadState>("idle");
  const [error, setError] = useState<string | null>(null);
  const didInitialLoadRef = useRef(false);

  const writeStoredSelection = useCallback(
    (product?: string, version?: string) => {
      if (typeof window === "undefined") return;
      try {
        if (product) window.localStorage.setItem(productKey, product);
        if (version) window.localStorage.setItem(versionKey, version);
      } catch {
        // ignore storage errors
      }
    },
    [productKey, versionKey],
  );

  const clearStoredProduct = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(productKey);
    } catch {
      // ignore storage errors
    }
  }, [productKey]);

  const resetContent = useCallback(() => {
    setItems([]);
    setTree([]);
    setStandaloneDocs([]);
  }, []);

  const resetVersions = useCallback(() => {
    setVersions([]);
  }, []);

  const loadData = useCallback(
    async (product?: string, version?: string) => {
      const selectionProduct = productVersioning ? product : undefined;
      const selectionVersion = version;
      setStatus("loading");
      setError(null);
      if (clearOnLoad) {
        resetContent();
      }
      try {
        const data = await documentationLoader.loadVersionData({
          product: selectionProduct,
          version: selectionVersion,
          source,
        });
        setProducts(data.products ?? []);
        setVersions(data.versions ?? []);
        setCurrentProduct(data.product ?? "");
        setCurrentVersion(data.version ?? "");
        setItems(data.items);
        setTree(data.tree);
        setStandaloneDocs(data.standaloneDocs ?? []);
        if (syncSelection) {
          if (
            productVersioning &&
            data.product &&
            data.product !== selectedProduct
          ) {
            setSelectedProduct(data.product);
          }
          if (data.version && data.version !== selectedVersion) {
            setSelectedVersion(data.version);
          }
        }
        setStatus("idle");
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        setStatus("error");
        return false;
      }
    },
    [
      clearOnLoad,
      productVersioning,
      resetContent,
      selectedProduct,
      selectedVersion,
      source,
      syncSelection,
    ],
  );

  const reload = useCallback(
    async (product?: string, version?: string) => {
      const nextProduct = product ?? selectedProduct;
      const nextVersion = version ?? selectedVersion;
      return await loadData(nextProduct, nextVersion);
    },
    [loadData, selectedProduct, selectedVersion],
  );

  useEffect(() => {
    if (!productVersioning) {
      clearStoredProduct();
      setSelectedProduct(undefined);
    }
  }, [clearStoredProduct, productVersioning]);

  useEffect(() => {
    if (autoLoad) return;
    if (didInitialLoadRef.current) return;
    didInitialLoadRef.current = true;
    void loadData(initialProduct, initialVersion);
  }, [autoLoad, initialProduct, initialVersion, loadData]);

  useEffect(() => {
    if (!autoLoad) return;
    void loadData(selectedProduct, selectedVersion);
  }, [autoLoad, loadData, selectedProduct, selectedVersion]);

  useEffect(() => {
    if (!productVersioning) {
      clearStoredProduct();
      if (currentVersion) writeStoredSelection(undefined, currentVersion);
      return;
    }
    if (currentProduct) writeStoredSelection(currentProduct, undefined);
    if (currentProduct && currentVersion) {
      writeStoredSelection(currentProduct, currentVersion);
    }
  }, [
    clearStoredProduct,
    currentProduct,
    currentVersion,
    productVersioning,
    writeStoredSelection,
  ]);

  return {
    products,
    versions,
    currentProduct,
    currentVersion,
    items,
    tree,
    standaloneDocs,
    selectedProduct,
    selectedVersion,
    status,
    error,
    reload,
    setCurrentProduct,
    setCurrentVersion,
    setSelectedProduct,
    setSelectedVersion,
    resetContent,
    resetVersions,
  } as const;
}
