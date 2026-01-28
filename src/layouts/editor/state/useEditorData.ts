import { useEffect, useMemo, useState } from "react";
import { useVersionedDocumentationLoader } from "../../../services/useVersionedDocumentationLoader";
import * as api from "../api/client";
import { clientConfig } from "../../../application/config/clientConfig";

interface UseEditorDataOptions {
  initialSelection?: { product?: string; version?: string };
}

export function useEditorData(options: UseEditorDataOptions = {}) {
  const { initialSelection } = options;
  const [lastPing, setLastPing] = useState<{ dataRoot?: string } | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const productVersioning = clientConfig.PRODUCT_VERSIONING ?? false;
  const {
    products,
    versions,
    currentProduct,
    currentVersion,
    items,
    tree,
    standaloneDocs,
    status,
    error: loadError,
    reload,
    setCurrentProduct,
    setCurrentVersion,
  } = useVersionedDocumentationLoader({
    storageKeyPrefix: "editor",
    productVersioning,
    initialSelection,
    source: "editor",
    autoLoad: false,
    clearOnLoad: true,
    syncSelection: true,
  });

  // Initial ping to verify middleware is up and get dataRoot info
  useEffect(() => {
    api
      .ping()
      .then((res) => setLastPing({ dataRoot: res.dataRoot }))
      .catch((err: Error) =>
        setApiError(`Editor API unavailable: ${err.message}`),
      );
  }, []);

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
    error: loadError ?? apiError,
    lastPing,
    reload,
    setCurrentProduct,
    setCurrentVersion,
  } as const;
}

export default useEditorData;
