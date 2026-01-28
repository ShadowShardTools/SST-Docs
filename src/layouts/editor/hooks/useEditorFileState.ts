import { useCallback, useEffect, useState } from "react";
import type { DocItem } from "@shadow-shard-tools/docs-core";
import {
  safeParseJson,
  sanitizeContentBlocks,
} from "../utilities/editorContent";

type FileStatus = "idle" | "loading" | "saving" | "error";

type ReadFn = (path: string) => Promise<{ content: string; encoding: string }>;
type Encoding = "utf8" | "base64";
type WriteFn = (
  path: string,
  content: string,
  encoding?: Encoding,
) => Promise<{ ok: boolean; path: string }>;
type ReloadFn = (product?: string, version?: string) => Promise<boolean>;

interface UseEditorFileStateOptions {
  defaultFilePath: string | null;
  selectedContent: DocItem["content"] | null;
  productVersioning: boolean;
  currentProduct: string;
  currentVersion: string;
  read: ReadFn;
  write: WriteFn;
  reload: ReloadFn;
}

export const useEditorFileState = ({
  defaultFilePath,
  selectedContent,
  productVersioning,
  currentProduct,
  currentVersion,
  read,
  write,
  reload,
}: UseEditorFileStateOptions) => {
  const [currentFilePath, setCurrentFilePath] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState("");
  const [fileStatus, setFileStatus] = useState<FileStatus>("idle");
  const [fileError, setFileError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [backupOnSave, setBackupOnSave] = useState(false);
  const [showSavedIndicator, setShowSavedIndicator] = useState(false);
  const [savedIndicatorTick, setSavedIndicatorTick] = useState(0);
  const [draftContent, setDraftContent] = useState<DocItem["content"]>(
    selectedContent ?? [],
  );

  useEffect(() => {
    setCurrentFilePath((prev) => {
      if (!defaultFilePath) return null;
      if (prev !== defaultFilePath) return defaultFilePath;
      return prev ?? defaultFilePath;
    });
  }, [defaultFilePath]);

  useEffect(() => {
    if (selectedContent) {
      setDraftContent(selectedContent);
    } else {
      setDraftContent([]);
    }
  }, [selectedContent]);

  useEffect(() => {
    if (!showSavedIndicator) return;
    const timeout = setTimeout(() => setShowSavedIndicator(false), 1200);
    return () => clearTimeout(timeout);
  }, [showSavedIndicator, savedIndicatorTick]);

  useEffect(() => {
    const loadFile = async () => {
      if (!currentFilePath) return;
      setFileStatus("loading");
      setFileError(null);
      setDirty(false);
      try {
        const res = await read(currentFilePath);
        if (res.encoding !== "utf8") {
          throw new Error(`Unsupported encoding: ${res.encoding}`);
        }
        setFileContent(res.content);
        setFileStatus("idle");
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to read file";
        setFileError(message);
        setFileStatus("error");
      }
    };
    void loadFile();
  }, [currentFilePath, read]);

  const handleSave = useCallback(async () => {
    if (!currentFilePath) return;
    setFileStatus("saving");
    setFileError(null);
    try {
      const maybeParsed = safeParseJson(fileContent);
      if (!maybeParsed) {
        setFileStatus("error");
        setFileError("Invalid JSON. Fix the JSON before saving.");
        return;
      }
      const sanitizedContent = Array.isArray(draftContent)
        ? sanitizeContentBlocks(draftContent)
        : draftContent;
      const merged =
        maybeParsed && Array.isArray(maybeParsed.content)
          ? {
              ...maybeParsed,
              content: sanitizedContent ?? maybeParsed.content,
            }
          : maybeParsed;
      const payload =
        merged && Array.isArray(sanitizedContent)
          ? { ...merged, content: sanitizedContent }
          : fileContent;

      if (backupOnSave) {
        await write(`${currentFilePath}.bak`, fileContent, "utf8");
      }

      if (typeof payload === "string") {
        await write(currentFilePath, payload, "utf8");
      } else {
        await write(currentFilePath, JSON.stringify(payload, null, 2), "utf8");
      }
      setDirty(false);
      setFileStatus("idle");
      await reload(
        productVersioning ? currentProduct : undefined,
        currentVersion,
      );
      setSavedIndicatorTick((prev) => prev + 1);
      setShowSavedIndicator(true);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save file";
      setFileError(message);
      setFileStatus("error");
    }
  }, [
    backupOnSave,
    currentFilePath,
    currentProduct,
    currentVersion,
    draftContent,
    fileContent,
    productVersioning,
    reload,
    write,
  ]);

  return {
    currentFilePath,
    setCurrentFilePath,
    fileStatus,
    fileError,
    dirty,
    setDirty,
    backupOnSave,
    setBackupOnSave,
    draftContent,
    setDraftContent,
    handleSave,
    showSavedIndicator,
    savedIndicatorTick,
  } as const;
};
