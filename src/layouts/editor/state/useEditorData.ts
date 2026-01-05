import { useEffect, useMemo, useState, useCallback } from "react";
import { documentationLoader } from "../../../services";
import * as api from "../api/client";
import { clientConfig } from "../../../application/config/clientConfig";
import type {
  Category,
  DocItem,
  Product,
  Version,
} from "@shadow-shard-tools/docs-core";

type LoadState = "idle" | "loading" | "error";

export function useEditorData() {
  const [products, setProducts] = useState<Product[]>([]);
  const [versions, setVersions] = useState<Version[]>([]);
  const [currentProduct, setCurrentProduct] = useState("");
  const [currentVersion, setCurrentVersion] = useState("");

  const [items, setItems] = useState<DocItem[]>([]);
  const [tree, setTree] = useState<Category[]>([]);
  const [standaloneDocs, setStandaloneDocs] = useState<DocItem[]>([]);

  const [status, setStatus] = useState<LoadState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [lastPing, setLastPing] = useState<{ dataRoot?: string } | null>(null);
  const productVersioning = clientConfig.PRODUCT_VERSIONING ?? false;
  const PRODUCT_KEY = "editor:selectedProduct";
  const VERSION_KEY = "editor:selectedVersion";

  const readStored = useCallback(() => {
    if (typeof window === "undefined")
      return { product: undefined, version: undefined };
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
      if (product) {
        window.localStorage.setItem(PRODUCT_KEY, product);
      }
      if (version) {
        window.localStorage.setItem(VERSION_KEY, version);
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  // Initial ping to verify middleware is up and get dataRoot info
  useEffect(() => {
    api
      .ping()
      .then((res) => setLastPing({ dataRoot: res.dataRoot }))
      .catch((err: Error) =>
        setError(`Editor API unavailable: ${err.message}`),
      );
  }, []);

  const loadData = useCallback(async (product?: string, version?: string) => {
    setStatus("loading");
    setError(null);
    setItems([]);
    setTree([]);
    setStandaloneDocs([]);
    try {
      const data = await documentationLoader.loadVersionData({
        product,
        version,
        source: "editor",
      });
      setProducts(data.products ?? []);
      setVersions(data.versions ?? []);
      setCurrentProduct(data.product ?? "");
      setCurrentVersion(data.version ?? "");
      setItems(data.items);
      setTree(data.tree);
      setStandaloneDocs(data.standaloneDocs ?? []);
      setStatus("idle");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    const stored = readStored();
    loadData(stored.product, stored.version);
  }, [loadData, readStored]);

  useEffect(() => {
    if (currentProduct) writeStored(currentProduct, undefined);
  }, [currentProduct, writeStored]);

  useEffect(() => {
    if (currentProduct && currentVersion)
      writeStored(currentProduct, currentVersion);
  }, [currentProduct, currentVersion, writeStored]);

  const dataInfo = useMemo(
    () => ({
      products,
      versions,
      currentProduct,
      currentVersion,
      items,
      tree,
      standaloneDocs,
    }),
    [
      products,
      versions,
      currentProduct,
      currentVersion,
      items,
      tree,
      standaloneDocs,
    ],
  );

  return {
    ...dataInfo,
    productVersioning,
    status,
    error,
    lastPing,
    reload: loadData,
    setCurrentProduct,
    setCurrentVersion,
  } as const;
}

export default useEditorData;
