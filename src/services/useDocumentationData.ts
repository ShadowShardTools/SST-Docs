import { useEffect, useState } from "react";
import { documentationLoader } from "./documentationLoader";
import type { Category, DocItem, Version } from "@shadow-shard-tools/docs-core";

interface LoadingState {
  versions: boolean;
  content: boolean;
}

interface ErrorState {
  versions?: string;
  content?: string;
}

export function useDocumentationData() {
  const [versions, setVersions] = useState<Version[]>([]);
  const [currentVersion, setCurrentVersion] = useState("");

  const [items, setItems] = useState<DocItem[]>([]);
  const [tree, setTree] = useState<Category[]>([]);
  const [standaloneDocs, setStandaloneDocs] = useState<DocItem[]>([]);

  const [loading, setLoading] = useState<LoadingState>({
    versions: true,
    content: true,
  });
  const [error, setError] = useState<ErrorState>({});

  // Debug info state
  const [debugInfo, setDebugInfo] = useState<{
    baseUrl?: string;
    lastAttemptedVersion?: string;
    lastError?: Error;
  }>({});

  // Load versions on mount
  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        console.log("Loading versions...");
        setDebugInfo((prev) => ({
          ...prev,
          baseUrl: import.meta.env.BASE_URL,
        }));

        const versionList = await documentationLoader.loadVersions();
        console.log("Versions loaded:", versionList);

        if (!isMounted) return;

        setVersions(versionList);
        setCurrentVersion(versionList[0]?.version || "");

        // Clear any previous version errors
        setError((err) => ({ ...err, versions: undefined }));
      } catch (err) {
        console.error("Failed to load versions:", err);

        if (!isMounted) return;

        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError((prev) => ({
          ...prev,
          versions: `Failed to load versions: ${errorMessage}`,
        }));
        setDebugInfo((prev) => ({ ...prev, lastError: err as Error }));
      } finally {
        if (isMounted) {
          setLoading((prev) => ({ ...prev, versions: false }));
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  // Load content when version changes
  useEffect(() => {
    if (!currentVersion) {
      console.log("No current version set, skipping content load");
      return;
    }

    let isMounted = true;

    (async () => {
      try {
        console.log(`Loading content for version: ${currentVersion}`);
        setDebugInfo((prev) => ({
          ...prev,
          lastAttemptedVersion: currentVersion,
        }));

        if (isMounted) {
          setLoading((prev) => ({ ...prev, content: true }));
          // Clear previous content errors
          setError((err) => ({ ...err, content: undefined }));
        }

        const data = await documentationLoader.loadVersionData(currentVersion);
        console.log("Content loaded successfully:", {
          itemsCount: data.items.length,
          treeCount: data.tree.length,
          standaloneDocsCount: data.standaloneDocs.length,
        });

        if (!isMounted) return;

        setItems(data.items);
        setTree(data.tree);
        setStandaloneDocs(data.standaloneDocs ?? []);
      } catch (err) {
        console.error(
          `Failed to load content for version ${currentVersion}:`,
          err,
        );

        if (!isMounted) return;

        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError((prev) => ({
          ...prev,
          content: `Failed to load documentation content for version ${currentVersion}: ${errorMessage}`,
        }));
        setDebugInfo((prev) => ({ ...prev, lastError: err as Error }));
      } finally {
        if (isMounted) {
          setLoading((prev) => ({ ...prev, content: false }));
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [currentVersion]);

  // Helper function to retry loading content
  const retryLoadContent = async () => {
    if (!currentVersion) return;

    console.log(`Retrying content load for version: ${currentVersion}`);
    setLoading((prev) => ({ ...prev, content: true }));
    setError((err) => ({ ...err, content: undefined }));

    try {
      const data = await documentationLoader.loadVersionData(currentVersion);
      setItems(data.items);
      setTree(data.tree);
      setStandaloneDocs(data.standaloneDocs ?? []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError((prev) => ({
        ...prev,
        content: `Retry failed: ${errorMessage}`,
      }));
    } finally {
      setLoading((prev) => ({ ...prev, content: false }));
    }
  };

  // Helper function to get debug information
  const getDebugInfo = () => {
    return {
      ...debugInfo,
      currentState: {
        versionsLoaded: versions.length > 0,
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
      },
    };
  };

  return {
    versions,
    currentVersion,
    setCurrentVersion,
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
