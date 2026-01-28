import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
} from "react";
import { ChevronLeft, Folder, Image as ImageIcon, X } from "lucide-react";
import type { StyleTheme } from "@shadow-shard-tools/docs-core";
import Button from "./Button";

export type FileBrowserEntry = {
  name: string;
  isDirectory: boolean;
  size: number;
  mtime: number;
};

interface PathInputProps {
  styles: StyleTheme;
  label: string;
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  publicBasePath?: string;
  listEntries?: (dir: string) => Promise<{
    dir: string;
    entries: FileBrowserEntry[];
  }>;
  allowedExtensions?: string[];
  initialDir?: string;
  disabled?: boolean;
  requiredFolder?: string;
  dialogTitle?: string;
  dialogIcon?: ComponentType<{ className?: string }>;
  fileIcon?: ComponentType<{ className?: string }>;
}

const normalizePublicBase = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "/";
  const withLeading = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return withLeading.endsWith("/") ? withLeading : `${withLeading}/`;
};

const joinPublicPath = (base: string, relative: string) => {
  const cleaned = relative.replace(/^[\\/]+/, "").replace(/\\/g, "/");
  return `${base}${cleaned}`;
};

const isAbsoluteUrl = (value: string) => {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

const isDataUrl = (value: string) => /^data:/i.test(value);

const toRelativeDir = (value: string, publicBase: string) => {
  const cleaned = value.replace(/\\/g, "/");
  if (!cleaned.startsWith(publicBase)) return ".";
  const remainder = cleaned.slice(publicBase.length);
  const parts = remainder.split("/").filter(Boolean);
  if (parts.length <= 1) return ".";
  parts.pop();
  return parts.join("/");
};

const normalizeExtensions = (extensions?: string[]) =>
  extensions?.map((ext) =>
    ext.startsWith(".") ? ext.toLowerCase() : `.${ext.toLowerCase()}`,
  ) ?? [];

const normalizeRequiredFolder = (value?: string) => {
  if (!value) return "";
  return value.replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
};

const getPathSegments = (value: string) =>
  value
    .replace(/\\/g, "/")
    .split("/")
    .filter((segment) => segment && segment !== ".");

const hasRequiredFolder = (value: string, required: string) => {
  if (!required) return true;
  const requiredLower = required.toLowerCase();
  return getPathSegments(value).some(
    (segment) => segment.toLowerCase() === requiredLower,
  );
};

export function PathInput({
  styles,
  label,
  value,
  onChange,
  placeholder,
  publicBasePath = "/",
  listEntries,
  allowedExtensions,
  initialDir,
  disabled = false,
  requiredFolder,
  dialogTitle,
  dialogIcon,
  fileIcon,
}: PathInputProps) {
  const [open, setOpen] = useState(false);
  const [currentDir, setCurrentDir] = useState(".");
  const [entries, setEntries] = useState<FileBrowserEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [browseError, setBrowseError] = useState<string | null>(null);
  const [inputError, setInputError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const publicBase = useMemo(
    () => normalizePublicBase(publicBasePath),
    [publicBasePath],
  );
  const allowedExts = useMemo(
    () => normalizeExtensions(allowedExtensions),
    [allowedExtensions],
  );
  const requiredSegment = useMemo(
    () => normalizeRequiredFolder(requiredFolder),
    [requiredFolder],
  );
  const isInRequiredFolder = useMemo(
    () => hasRequiredFolder(currentDir, requiredSegment),
    [currentDir, requiredSegment],
  );
  const requiredLabel = requiredSegment ? `/${requiredSegment}/` : null;
  const DialogIcon = dialogIcon ?? ImageIcon;
  const FileIcon = fileIcon ?? ImageIcon;
  const dialogTitleText = dialogTitle ?? "Select file";

  const isAllowedFile = (name: string) => {
    if (!allowedExts.length) return true;
    const ext = `.${name.split(".").pop()?.toLowerCase() ?? ""}`;
    return allowedExts.includes(ext);
  };

  const validateValue = (next: string) => {
    const trimmed = next.trim();
    if (!trimmed) {
      setInputError(null);
      return true;
    }
    if (isAbsoluteUrl(trimmed) || isDataUrl(trimmed)) {
      setInputError(null);
      return true;
    }
    if (!trimmed.startsWith(publicBase)) {
      setInputError(`Path must start with ${publicBase}`);
      return false;
    }
    if (!hasRequiredFolder(trimmed.slice(publicBase.length), requiredSegment)) {
      setInputError(`Path must include ${requiredLabel}`);
      return false;
    }
    setInputError(null);
    return true;
  };

  useEffect(() => {
    validateValue(value);
  }, [value, publicBase]);

  useEffect(() => {
    if (!open || !listEntries) return;
    let active = true;
    setLoading(true);
    setBrowseError(null);
    listEntries(currentDir)
      .then((res) => {
        if (!active) return;
        setEntries(res.entries ?? []);
      })
      .catch((err) => {
        if (!active) return;
        const message = err instanceof Error ? err.message : String(err);
        setBrowseError(message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [open, currentDir, listEntries]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (dialogRef.current && !dialogRef.current.contains(target)) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", handleKey);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const openBrowser = () => {
    if (!listEntries) return;
    const derivedDir =
      initialDir ?? toRelativeDir(value ?? "", publicBase) ?? ".";
    setCurrentDir(derivedDir || ".");
    setOpen(true);
  };

  const goUp = () => {
    if (currentDir === "." || !currentDir) return;
    const parts = currentDir.split("/").filter(Boolean);
    parts.pop();
    setCurrentDir(parts.length ? parts.join("/") : ".");
  };

  const handleSelectFile = (name: string) => {
    if (requiredSegment && !isInRequiredFolder) {
      return;
    }
    const relativePath = currentDir === "." ? name : `${currentDir}/${name}`;
    const publicPath = joinPublicPath(publicBase, relativePath);
    onChange(publicPath);
    setInputError(null);
    setOpen(false);
  };

  const sortedEntries = useMemo(() => {
    const dirs = entries.filter((entry) => entry.isDirectory);
    const files = entries.filter((entry) => !entry.isDirectory);
    dirs.sort((a, b) => a.name.localeCompare(b.name));
    files.sort((a, b) => a.name.localeCompare(b.name));
    return { dirs, files };
  }, [entries]);

  return (
    <div className="flex flex-col gap-1">
      <span className={`${styles.text.alternative}`}>{label}</span>
      <div className="flex items-center gap-2">
        <input
          className={`${styles.input} px-2 py-1 flex-1`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
        />
        {listEntries && (
          <Button
            type="button"
            className="inline-flex items-center justify-center w-8 h-8"
            styles={styles}
            onClick={openBrowser}
            title="Browse files"
            aria-label="Browse files"
            disabled={disabled}
          >
            ...
          </Button>
        )}
      </div>
      {inputError && (
        <span className="text-xs text-amber-500">{inputError}</span>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div
            ref={dialogRef}
            className={`w-[min(760px,92vw)] max-h-[80vh] overflow-hidden rounded-lg border ${styles.modal.borders}`}
          >
            <div
              className={`flex items-center justify-between px-4 py-2 border-b ${styles.modal.borders} ${styles.modal.header}`}
            >
              <div className="flex items-center gap-2 text-sm">
                <DialogIcon className="w-4 h-4" />
                <span>{dialogTitleText}</span>
                <span className="text-xs text-slate-500">
                  {currentDir === "." ? "/" : `/${currentDir}`}
                </span>
              </div>
              <Button
                type="button"
                className="inline-flex items-center justify-center w-8 h-8"
                styles={styles}
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className={`p-4 space-y-3 ${styles.modal.content}`}>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  className="inline-flex items-center gap-1 px-2 py-1"
                  styles={styles}
                  onClick={goUp}
                  disabled={currentDir === "."}
                  aria-label="Go up"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Up
                </Button>
                <span className="text-xs text-slate-500">
                  Root: {publicBase}
                </span>
                {requiredLabel && (
                  <span className="text-xs text-slate-500">
                    Required: {requiredLabel}
                  </span>
                )}
              </div>

              {loading && (
                <div className="text-xs text-slate-500">Loading...</div>
              )}
              {browseError && (
                <div className="text-xs text-rose-500">{browseError}</div>
              )}

              {!loading && !browseError && (
                <div className="max-h-[55vh] overflow-y-auto space-y-1">
                  {sortedEntries.dirs.map((entry) => (
                    <button
                      key={`dir-${entry.name}`}
                      type="button"
                      className={`w-full text-left px-3 py-2 flex items-center gap-2 ${styles.dropdown.item}`}
                      onClick={() =>
                        setCurrentDir(
                          currentDir === "."
                            ? entry.name
                            : `${currentDir}/${entry.name}`,
                        )
                      }
                    >
                      <Folder className="w-4 h-4" />
                      <span>{entry.name}</span>
                    </button>
                  ))}
                  {sortedEntries.files
                    .filter(
                      (entry) =>
                        isAllowedFile(entry.name) && isInRequiredFolder,
                    )
                    .map((entry) => (
                      <button
                        key={`file-${entry.name}`}
                        type="button"
                        className={`w-full text-left px-3 py-2 flex items-center gap-2 ${styles.dropdown.item}`}
                        onClick={() => handleSelectFile(entry.name)}
                      >
                        <FileIcon className="w-4 h-4" />
                        <span>{entry.name}</span>
                      </button>
                    ))}
                  {requiredSegment && !isInRequiredFolder && (
                    <div className="text-xs text-slate-500 px-3 py-2">
                      Select a file inside {requiredLabel}.
                    </div>
                  )}
                  {!sortedEntries.dirs.length &&
                    !sortedEntries.files.filter(
                      (entry) =>
                        isAllowedFile(entry.name) && isInRequiredFolder,
                    ).length && (
                      <div className="text-xs text-slate-500 px-3 py-2">
                        No files found.
                      </div>
                    )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PathInput;
