import { useCallback } from "react";
import type { Product, Version } from "@shadow-shard-tools/docs-core";
import type {
  ListFn,
  NavigateFn,
  ReadFn,
  ReloadFn,
  RemoveFn,
  WriteFn,
} from "./versionActions/types";
import {
  copyDirectory,
  duplicateProductContent,
  remapVersionContent,
} from "./versionActions/versionDuplication";
import {
  generateProductId,
  generateVersionId,
  getNextLabel,
  getProductIdSet,
  getProductLabelSet,
  getVersionIdSet,
  getVersionLabelSet,
} from "./versionActions/versionIds";
import {
  readJsonFile,
  waitForProductReady,
} from "./versionActions/versionJson";
import {
  alertSelectProduct,
  confirmDeleteProduct,
  confirmDeleteVersion,
  promptForEditProductLabel,
  promptForEditVersionLabel,
  promptForProductLabel,
  promptForVersionLabel,
} from "./versionActions/versionPrompts";

interface UseEditorVersionActionsOptions {
  productVersioning: boolean;
  currentProduct: string;
  currentVersion: string;
  products: Product[];
  versions: Version[];
  reload: ReloadFn;
  setCurrentProduct: (product: string) => void;
  setCurrentVersion: (version: string) => void;
  setCurrentFilePath: (path: string | null) => void;
  navigate: NavigateFn;
  read: ReadFn;
  write: WriteFn;
  remove: RemoveFn;
  list: ListFn;
  createProduct: (
    productId: string,
    label: string,
    skipInit?: boolean,
  ) => Promise<{ ok: boolean; product: string; label?: string }>;
  deleteProduct: (productId: string) => Promise<{ ok: boolean }>;
  createVersion: (
    productId: string | undefined,
    versionId: string,
    label: string,
  ) => Promise<{ ok: boolean }>;
  deleteVersion: (
    productId: string | undefined,
    versionId: string,
  ) => Promise<{ ok: boolean }>;
  updateProduct: (
    productId: string,
    label: string,
  ) => Promise<{ ok: boolean; product: string; label?: string }>;
  updateVersion: (
    productId: string | undefined,
    versionId: string,
    label: string,
  ) => Promise<{ ok: boolean; version: string; label?: string }>;
}

export const useEditorVersionActions = ({
  productVersioning,
  currentProduct,
  currentVersion,
  products,
  versions,
  reload,
  setCurrentProduct,
  setCurrentVersion,
  setCurrentFilePath,
  navigate,
  read,
  write,
  remove,
  list,
  createProduct,
  deleteProduct,
  createVersion,
  deleteVersion,
  updateProduct,
  updateVersion,
}: UseEditorVersionActionsOptions) => {
  const readJson = useCallback(
    async (path: string) => readJsonFile(read, path),
    [read],
  );

  const waitForVersionedProduct = useCallback(
    async (productId?: string, versionId?: string) =>
      waitForProductReady({
        productVersioning,
        productId,
        versionId,
        readJson,
      }),
    [productVersioning, readJson],
  );

  const handleSelectProduct = useCallback(
    (product: string) => {
      if (!productVersioning) return;
      setCurrentFilePath(null);
      navigate(`/editor`, { replace: true });
      void reload(product, undefined);
    },
    [navigate, productVersioning, reload, setCurrentFilePath],
  );

  const handleSelectVersion = useCallback(
    (version: string) => {
      const product = productVersioning ? currentProduct : undefined;
      if (productVersioning && !product) return;
      setCurrentFilePath(null);
      navigate(`/editor`, { replace: true });
      void reload(product, version);
    },
    [currentProduct, navigate, productVersioning, reload, setCurrentFilePath],
  );

  const handleCreateProduct = useCallback(async () => {
    if (!productVersioning) return;
    const label = promptForProductLabel();
    if (!label) return;
    try {
      const productId = generateProductId(getProductIdSet(products));
      const res = await createProduct(productId, label);
      await waitForVersionedProduct(res.product);
      await reload(res.product, undefined);
      setCurrentProduct(res.product);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      alert(`Failed to create product: ${message}`);
    }
  }, [
    createProduct,
    productVersioning,
    products,
    reload,
    setCurrentProduct,
    waitForVersionedProduct,
  ]);

  const handleDeleteProduct = useCallback(async () => {
    if (!productVersioning) return;
    if (!currentProduct) return;
    const confirmed = confirmDeleteProduct(currentProduct);
    if (!confirmed) return;
    try {
      await deleteProduct(currentProduct);
      await reload(undefined, undefined);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      alert(`Failed to delete product: ${message}`);
    }
  }, [currentProduct, deleteProduct, productVersioning, reload]);

  const handleCreateVersion = useCallback(async () => {
    if (productVersioning && !currentProduct) {
      alertSelectProduct();
      return;
    }
    const label = promptForVersionLabel();
    const version = generateVersionId(getVersionIdSet(versions));
    try {
      const productId = productVersioning ? currentProduct : undefined;
      await createVersion(productId, version, label);
      await waitForVersionedProduct(productId, version);
      await reload(productId, version);
      setCurrentVersion(version);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      alert(`Failed to create version: ${message}`);
    }
  }, [
    createVersion,
    currentProduct,
    productVersioning,
    reload,
    setCurrentVersion,
    versions,
    waitForVersionedProduct,
  ]);

  const handleDeleteVersion = useCallback(async () => {
    if (!currentVersion) return;
    if (productVersioning && !currentProduct) return;
    const confirmed = confirmDeleteVersion({
      productVersioning,
      productId: currentProduct,
      versionId: currentVersion,
    });
    if (!confirmed) return;
    try {
      const productId = productVersioning ? currentProduct : undefined;
      await deleteVersion(productId, currentVersion);
      await reload(productId, undefined);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      alert(`Failed to delete version: ${message}`);
    }
  }, [
    currentProduct,
    currentVersion,
    deleteVersion,
    productVersioning,
    reload,
  ]);

  const handleEditProduct = useCallback(async () => {
    if (!productVersioning) return;
    if (!currentProduct) return;
    const label = promptForEditProductLabel();
    if (!label) return;
    try {
      const res = await updateProduct(currentProduct, label);
      await reload(res.product, currentVersion);
      setCurrentProduct(res.product);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      alert(`Failed to update product: ${message}`);
    }
  }, [
    currentProduct,
    currentVersion,
    productVersioning,
    reload,
    setCurrentProduct,
    updateProduct,
  ]);

  const handleEditVersion = useCallback(async () => {
    if (!currentVersion) return;
    if (productVersioning && !currentProduct) return;
    const label = promptForEditVersionLabel();
    if (!label) return;
    try {
      const productId = productVersioning ? currentProduct : undefined;
      const res = await updateVersion(productId, currentVersion, label);
      await reload(productId, res.version);
      setCurrentVersion(res.version);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      alert(`Failed to update version: ${message}`);
    }
  }, [
    currentProduct,
    currentVersion,
    productVersioning,
    reload,
    setCurrentVersion,
    updateVersion,
  ]);

  const copyDirectoryContents = useCallback(
    async (sourceDir: string, targetDir: string) =>
      copyDirectory(sourceDir, targetDir, list, read, write),
    [list, read, write],
  );

  const remapContent = useCallback(
    async (
      productId: string,
      versionId: string,
      sourceRoot?: string,
      targetRoot?: string,
    ) =>
      remapVersionContent(
        productId,
        versionId,
        list,
        read,
        write,
        remove,
        sourceRoot,
        targetRoot,
      ),
    [list, read, write, remove],
  );

  const duplicateProductVersions = useCallback(
    async (sourceProduct: string, targetProduct: string) =>
      duplicateProductContent(
        sourceProduct,
        targetProduct,
        list,
        read,
        write,
        remove,
      ),
    [list, read, write, remove],
  );

  const handleDuplicateProduct = useCallback(async () => {
    if (!productVersioning) return;
    if (!currentProduct) return;
    const existingIds = getProductIdSet(products);
    const existingLabels = getProductLabelSet(products);
    const baseLabel =
      products.find((p) => p.product === currentProduct)?.label ??
      currentProduct;
    const newId = generateProductId(existingIds);
    const newLabel = getNextLabel(baseLabel, existingLabels);
    try {
      const res = await createProduct(newId, newLabel, true);

      const sourceDir = `${currentProduct}`;
      const targetDir = `${res.product}`;
      await duplicateProductVersions(sourceDir, targetDir);
      await waitForVersionedProduct(res.product);
      await reload(res.product, undefined);
      setCurrentProduct(res.product);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      alert(`Failed to duplicate product: ${message}`);
    }
  }, [
    createProduct,
    currentProduct,
    deleteVersion,
    duplicateProductVersions,
    productVersioning,
    products,
    read,
    reload,
    setCurrentProduct,
    waitForVersionedProduct,
    write,
  ]);

  const handleDuplicateVersion = useCallback(async () => {
    if (!currentVersion) return;
    if (productVersioning && !currentProduct) return;
    const existingIds = getVersionIdSet(versions);
    const existingLabels = getVersionLabelSet(versions);
    const currentLabel =
      versions.find((v) => v.version === currentVersion)?.label ??
      currentVersion;
    const newLabel = getNextLabel(currentLabel, existingLabels);
    const newVersion = generateVersionId(existingIds);
    try {
      const productId = productVersioning ? currentProduct : undefined;
      await createVersion(productId, newVersion, newLabel);
      const sourceDir = productVersioning
        ? `${currentProduct}/${currentVersion}`
        : currentVersion;
      const targetDir = productVersioning
        ? `${currentProduct}/${newVersion}`
        : newVersion;
      await copyDirectoryContents(sourceDir, targetDir);
      if (productId) {
        await remapContent(productId, newVersion, sourceDir, targetDir);
      }
      await waitForVersionedProduct(productId, newVersion);
      await reload(productId, newVersion);
      setCurrentVersion(newVersion);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      alert(`Failed to duplicate version: ${message}`);
    }
  }, [
    copyDirectoryContents,
    createVersion,
    currentProduct,
    currentVersion,
    productVersioning,
    reload,
    setCurrentVersion,
    versions,
    waitForVersionedProduct,
    remapContent,
  ]);

  return {
    handleSelectProduct,
    handleSelectVersion,
    handleCreateProduct,
    handleDeleteProduct,
    handleEditProduct,
    handleCreateVersion,
    handleDeleteVersion,
    handleEditVersion,
    handleDuplicateProduct,
    handleDuplicateVersion,
  } as const;
};
