import { useMemo, useState } from "react";
import { Image as ImageIcon, Music2 } from "lucide-react";
import type { StyleTheme } from "@shadow-shard-tools/docs-core/types/StyleTheme";
import PathInput from "../../../common/components/PathInput";
import { list, remove, upload } from "../../api/client";
import { clientConfig } from "../../../../application/config/clientConfig";
import { resolvePublicDataPath } from "@shadow-shard-tools/docs-core/configs";

interface MediaPathInputProps {
  styles: StyleTheme;
  label: string;
  value: string;
  onChange: (next: string) => void;
  requiredFolder: string;
  allowedExtensions?: string[];
  placeholder?: string;
  versionBasePath?: string | null;
  disabled?: boolean;
}

const normalizeSegment = (value?: string | null) => {
  if (!value) return "";
  return value.replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
};

const normalizeExtensions = (extensions?: string[]) =>
  extensions?.map((ext) =>
    ext.startsWith(".") ? ext.toLowerCase() : `.${ext.toLowerCase()}`,
  ) ?? [];

const normalizePublicBase = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "/";
  const withLeading = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return withLeading.endsWith("/") ? withLeading : `${withLeading}/`;
};

const toRelativeDir = (value: string) => {
  const cleaned = value.replace(/\\/g, "/");
  const parts = cleaned.split("/").filter(Boolean);
  if (parts.length <= 1) return ".";
  parts.pop();
  return parts.join("/");
};

export function MediaPathInput({
  styles,
  label,
  value,
  onChange,
  requiredFolder,
  allowedExtensions,
  placeholder,
  versionBasePath,
  disabled = false,
}: MediaPathInputProps) {
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const basePath = useMemo(
    () => normalizeSegment(versionBasePath),
    [versionBasePath],
  );
  const folder = useMemo(
    () => normalizeSegment(requiredFolder),
    [requiredFolder],
  );
  const allowedExts = useMemo(
    () => normalizeExtensions(allowedExtensions),
    [allowedExtensions],
  );
  const accept = allowedExts.length ? allowedExts.join(",") : undefined;
  const targetDir = useMemo(() => {
    if (!basePath) return "";
    if (!folder) return basePath;
    return `${basePath}/${folder}`;
  }, [basePath, folder]);
  const publicBasePath = useMemo(
    () => clientConfig.PUBLIC_DATA_PATH ?? "/",
    [],
  );
  const previewBasePath = useMemo(
    () =>
      resolvePublicDataPath(import.meta.env.BASE_URL ?? "/", clientConfig),
    [],
  );
  const normalizedPublicBase = useMemo(
    () => normalizePublicBase(publicBasePath),
    [publicBasePath],
  );

  const resolveInitialDir = () => {
    if (!basePath) return "";
    const trimmed = value.trim();
    if (trimmed) {
      if (!trimmed.startsWith("/") && !trimmed.startsWith("http")) {
        return toRelativeDir(trimmed);
      }
      if (trimmed.startsWith(normalizedPublicBase)) {
        const relative = trimmed.slice(normalizedPublicBase.length);
        return toRelativeDir(relative);
      }
    }
    return targetDir || basePath;
  };

  const validateExtension = (fileName: string) => {
    if (!allowedExts.length) return true;
    const ext = `.${fileName.split(".").pop()?.toLowerCase() ?? ""}`;
    return allowedExts.includes(ext);
  };

  const setValue = (next: string) => {
    onChange(next);
    setStatus(null);
  };

  const handleUpload = async (file: File, currentDir: string) => {
    if (!basePath) return;
    if (!validateExtension(file.name)) {
      window.alert(
        `Unsupported file type. Allowed: ${allowedExts.join(", ")}`,
      );
      return;
    }
    const normalizedDir = currentDir === "." ? basePath : currentDir;
    const publicRoot = normalizeSegment(publicBasePath);
    const targetPath = publicRoot
      ? `/${publicRoot}/${normalizedDir}/${file.name}`
      : `/${normalizedDir}/${file.name}`;
    const lowerName = file.name.toLowerCase();
    let existing = false;
    try {
      const res = await list(normalizedDir || ".");
      existing = (res.entries ?? []).some(
        (entry) =>
          !entry.isDirectory && entry.name.toLowerCase() === lowerName,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setStatus(`Unable to check existing files: ${message}`);
    }
    if (existing) {
      window.alert(
        `A file named "${file.name}" already exists in ${normalizedDir}/. Using the existing file.`,
      );
      setValue(targetPath);
      return;
    }

    setUploading(true);
    try {
      await upload(targetPath, file);
      setValue(targetPath);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setStatus(`Upload failed: ${message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fileName: string, currentDir: string) => {
    const normalizedDir = currentDir === "." ? basePath : currentDir;
    const targetPath = `${normalizedDir}/${fileName}`;
    await remove(targetPath);
  };

  return (
    <div className="flex flex-col gap-1">
      <PathInput
        styles={styles}
        label={label}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        publicBasePath={publicBasePath}
        previewBasePath={previewBasePath}
        allowRelative
        listEntries={list}
        allowedExtensions={allowedExtensions}
        requiredFolder={requiredFolder}
        onUpload={handleUpload}
        uploadLabel={folder === "audio" ? "Add audio..." : "Add image..."}
        uploadAccept={accept}
        uploadIcon={folder === "audio" ? Music2 : ImageIcon}
        fileIcon={folder === "audio" ? Music2 : ImageIcon}
        onDelete={handleDelete}
        previewType={folder === "audio" ? "audio" : "image"}
        initialDir={resolveInitialDir()}
        rootDir={targetDir || undefined}
        disabled={disabled}
      />
      {!basePath && (
        <span className="text-xs text-amber-600">
          Select a version to upload files.
        </span>
      )}
      {uploading && (
        <span className="text-xs text-slate-500">Uploading...</span>
      )}
      {status && <span className="text-xs text-rose-500">{status}</span>}
    </div>
  );
}

export default MediaPathInput;
