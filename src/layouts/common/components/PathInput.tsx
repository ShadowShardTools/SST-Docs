import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type ChangeEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { ChevronLeft, Folder, Image as ImageIcon, Trash2 } from "lucide-react";
import SearchModalFooter from "../../searchModal/components/SearchModalFooter";
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
  previewBasePath?: string;
  allowRelative?: boolean;
  listEntries?: (dir: string) => Promise<{
    dir: string;
    entries: FileBrowserEntry[];
  }>;
  onBrowse?: () => void;
  browseDisabled?: boolean;
  onUpload?: (file: File, currentDir: string) => Promise<void> | void;
  uploadLabel?: string;
  uploadAccept?: string;
  uploadIcon?: ComponentType<{ className?: string }>;
  onDelete?: (fileName: string, currentDir: string) => Promise<void> | void;
  previewType?: "image" | "audio" | "none";
  allowedExtensions?: string[];
  initialDir?: string;
  rootDir?: string;
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
  previewBasePath,
  allowRelative = false,
  listEntries,
  onBrowse,
  browseDisabled = false,
  onUpload,
  uploadLabel,
  uploadAccept,
  uploadIcon,
  onDelete,
  previewType = "none",
  allowedExtensions,
  initialDir,
  rootDir,
  disabled = false,
  requiredFolder,
  dialogTitle,
  fileIcon,
}: PathInputProps) {
  const [open, setOpen] = useState(false);
  const [currentDir, setCurrentDir] = useState(".");
  const [entries, setEntries] = useState<FileBrowserEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [browseError, setBrowseError] = useState<string | null>(null);
  const [inputError, setInputError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);
  const [filterTerm, setFilterTerm] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [preview, setPreview] = useState<{
    name: string;
    x: number;
    y: number;
  } | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewNeedsGesture, setPreviewNeedsGesture] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const filterInputRef = useRef<HTMLInputElement>(null);
  const previewTimerRef = useRef<number | null>(null);
  const lastPointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const previewAudioRef = useRef<HTMLAudioElement>(null);
  const selectedIndexRef = useRef(selectedIndex);
  const currentDirRef = useRef(currentDir);

  const publicBase = useMemo(
    () => normalizePublicBase(publicBasePath),
    [publicBasePath],
  );
  const previewBase = useMemo(
    () => normalizePublicBase(previewBasePath ?? publicBasePath),
    [previewBasePath, publicBasePath],
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
  const FileIcon = fileIcon ?? ImageIcon;
  const UploadIcon = uploadIcon ?? ImageIcon;
  const dialogTitleText = dialogTitle ?? "Select file";
  const normalizedRoot = useMemo(
    () => normalizeRequiredFolder(rootDir),
    [rootDir],
  );

  const clampDir = (dir: string) => {
    if (!normalizedRoot) return dir || ".";
    const normalized = normalizeRequiredFolder(dir || ".");
    if (!normalized || normalized === ".") return normalizedRoot;
    if (normalized === normalizedRoot) return normalized;
    if (normalized.startsWith(`${normalizedRoot}/`)) return normalized;
    return normalizedRoot;
  };

  const isAllowedFile = (name: string) => {
    if (!allowedExts.length) return true;
    if (name.startsWith(".")) return false;
    const lastDot = name.lastIndexOf(".");
    if (lastDot <= 0) return false;
    const ext = name.slice(lastDot).toLowerCase();
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
    const isRelative =
      allowRelative &&
      !trimmed.startsWith("/") &&
      !trimmed.startsWith(publicBase);
    if (isRelative) {
      if (!hasRequiredFolder(trimmed, requiredSegment)) {
        setInputError(`Path must include ${requiredLabel}`);
        return false;
      }
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
  }, [value, publicBase, allowRelative, requiredSegment]);

  useEffect(() => {
    if (!open || !listEntries) return;
    if (normalizedRoot) {
      const clamped = clampDir(currentDir);
      if (clamped !== currentDir) {
        setCurrentDir(clamped);
        return;
      }
    }
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
  }, [open, currentDir, listEntries, refreshTick]);

  useEffect(() => {
    selectedIndexRef.current = selectedIndex;
  }, [selectedIndex]);

  useEffect(() => {
    currentDirRef.current = currentDir;
  }, [currentDir]);

  useEffect(() => {
    if (!open) return;
    if (filterInputRef.current) {
      filterInputRef.current.focus();
    }
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        handlePreviewLeave();
        return;
      }
      if (!open) return;
      if (!["ArrowDown", "ArrowUp", "Enter"].includes(event.key)) return;
      event.preventDefault();
      const items = selectableItemsRef.current;
      if (!items.length) return;
      if (event.key === "ArrowDown") {
        setSelectedIndex((prev) => {
          if (prev < 0) return 0;
          return prev < items.length - 1 ? prev + 1 : prev;
        });
      } else if (event.key === "ArrowUp") {
        setSelectedIndex((prev) => {
          if (prev < 0) return items.length - 1;
          return prev > 0 ? prev - 1 : prev;
        });
      } else if (event.key === "Enter") {
        const activeIndex = selectedIndexRef.current;
        const index = activeIndex < 0 ? 0 : activeIndex;
        const item = items[index];
        if (!item) return;
        if (activeIndex < 0) setSelectedIndex(index);
        if (item.type === "upload") {
          uploadInputRef.current?.click();
        } else if (item.type === "dir") {
          setCurrentDir(
            currentDirRef.current === "."
              ? item.name
              : `${currentDirRef.current}/${item.name}`,
          );
        } else if (item.type === "file") {
          handleSelectFile(item.name);
        }
      }
    };
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (dialogRef.current && !dialogRef.current.contains(target)) {
        setOpen(false);
        handlePreviewLeave();
      }
    };
    document.addEventListener("keydown", handleKey);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  useEffect(() => {
    if (open) return;
    clearPreviewTimer();
    setPreview(null);
    setPreviewError(null);
    setPreviewNeedsGesture(false);
    setFilterTerm("");
    setSelectedIndex(-1);
  }, [open]);

  const openBrowser = () => {
    if (!listEntries) return;
    const derivedDir =
      initialDir ?? toRelativeDir(value ?? "", publicBase) ?? ".";
    setCurrentDir(clampDir(derivedDir || "."));
    setOpen(true);
  };

  const goUp = () => {
    if (currentDir === "." || !currentDir) return;
    const parts = currentDir.split("/").filter(Boolean);
    parts.pop();
    const next = parts.length ? parts.join("/") : ".";
    setCurrentDir(clampDir(next));
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
    handlePreviewLeave();
  };

  const handleUploadSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !onUpload) return;
    setUploading(true);
    setUploadError(null);
    try {
      await onUpload(file, currentDir);
      setRefreshTick((tick) => tick + 1);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setUploadError(message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (name: string) => {
    if (!onDelete) return;
    const confirmed = window.confirm(`Delete "${name}"?`);
    if (!confirmed) return;
    try {
      await onDelete(name, currentDir);
      setRefreshTick((tick) => tick + 1);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setUploadError(message);
    }
  };

  const resolvePreviewPath = (name: string) => {
    const relativePath = currentDir === "." ? name : `${currentDir}/${name}`;
    return encodeURI(joinPublicPath(previewBase, relativePath));
  };

  const clearPreviewTimer = () => {
    if (previewTimerRef.current) {
      window.clearTimeout(previewTimerRef.current);
      previewTimerRef.current = null;
    }
  };

  const schedulePreview = (name: string) => {
    clearPreviewTimer();
    previewTimerRef.current = window.setTimeout(() => {
      setPreviewError(null);
      setPreviewNeedsGesture(false);
      setPreview({
        name,
        x: lastPointerRef.current.x,
        y: lastPointerRef.current.y,
      });
    }, 300);
  };

  const handlePreviewEnter = (name: string, event: ReactMouseEvent) => {
    lastPointerRef.current = { x: event.clientX, y: event.clientY };
    schedulePreview(name);
  };

  const handlePreviewMove = (name: string, event: ReactMouseEvent) => {
    lastPointerRef.current = { x: event.clientX, y: event.clientY };
    if (preview?.name === name) {
      setPreview({ name, x: event.clientX, y: event.clientY });
    }
  };

  const handlePreviewLeave = () => {
    clearPreviewTimer();
    setPreview(null);
  };

  const sortedEntries = useMemo(() => {
    const dirs = entries.filter((entry) => entry.isDirectory);
    const files = entries.filter((entry) => !entry.isDirectory);
    dirs.sort((a, b) => a.name.localeCompare(b.name));
    files.sort((a, b) => a.name.localeCompare(b.name));
    return { dirs, files };
  }, [entries]);

  const filteredEntries = useMemo(() => {
    const term = filterTerm.trim().toLowerCase();
    if (!term) return sortedEntries;
    return {
      dirs: sortedEntries.dirs.filter((entry) =>
        entry.name.toLowerCase().includes(term),
      ),
      files: sortedEntries.files.filter((entry) =>
        entry.name.toLowerCase().includes(term),
      ),
    };
  }, [sortedEntries, filterTerm]);

  const selectableItems = useMemo(() => {
    const items: Array<{ type: "upload" | "dir" | "file"; name: string }> = [];
    if (onUpload) items.push({ type: "upload", name: "__upload__" });
    filteredEntries.dirs.forEach((dir) =>
      items.push({ type: "dir", name: dir.name }),
    );
    filteredEntries.files
      .filter((entry) => isAllowedFile(entry.name))
      .forEach((file) => items.push({ type: "file", name: file.name }));
    return items;
  }, [filteredEntries, onUpload, isAllowedFile]);

  const selectableItemsRef = useRef(selectableItems);
  useEffect(() => {
    selectableItemsRef.current = selectableItems;
    setSelectedIndex((prev) => {
      if (prev < 0) return prev;
      return prev >= selectableItems.length ? -1 : prev;
    });
  }, [selectableItems]);

  return (
    <div className="flex flex-col gap-1">
      <span className={`${styles.text.alternative}`}>{label}</span>
      <div className="flex items-center gap-2">
        <input
          className={`${styles.input} px-2 py-1 flex-1`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          readOnly
          disabled={disabled}
        />
        {(listEntries || onBrowse) && (
          <Button
            type="button"
            className="inline-flex items-center justify-center w-8 h-8"
            styles={styles}
            onClick={onBrowse ?? openBrowser}
            title="Browse files"
            aria-label="Browse files"
            disabled={disabled || browseDisabled}
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
              <input
                ref={filterInputRef}
                type="text"
                value={filterTerm}
                onChange={(e) => setFilterTerm(e.target.value)}
                placeholder={dialogTitleText}
                className="flex-1 px-3 py-2 text-sm focus:outline-none bg-transparent"
              />
            </div>
            <div className={`p-4 space-y-3 ${styles.modal.content}`}>
              {uploadError && (
                <div className="text-xs text-rose-500">{uploadError}</div>
              )}
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  className="inline-flex items-center gap-1 px-2 py-1"
                  styles={styles}
                  onClick={goUp}
                  disabled={
                    currentDir === "." ||
                    (!!normalizedRoot && currentDir === normalizedRoot)
                  }
                  aria-label="Go up"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Up
                </Button>
              </div>

              {loading && (
                <div className="text-xs text-slate-500">Loading...</div>
              )}
              {browseError && (
                <div className="text-xs text-rose-500">{browseError}</div>
              )}

              {!loading && !browseError && (
                <div className="max-h-[55vh] overflow-y-auto space-y-1">
                  {onUpload && (
                    <button
                      type="button"
                      className={`w-full text-left px-3 py-2 flex items-center gap-2 cursor-pointer ${
                        selectedIndex === 0
                          ? styles.searchModal.selectedItem
                          : styles.searchModal.item
                      }`}
                      onClick={() => uploadInputRef.current?.click()}
                      onMouseEnter={() => setSelectedIndex(0)}
                      disabled={uploading}
                    >
                      <UploadIcon className="w-4 h-4" />
                      <span>{uploadLabel ?? "Add file..."}</span>
                    </button>
                  )}
                  {filteredEntries.dirs.map((entry, dirIndex) => {
                    const index = (onUpload ? 1 : 0) + dirIndex;
                    const isSelected = selectedIndex === index;
                    return (
                      <button
                        key={`dir-${entry.name}`}
                        type="button"
                        className={`w-full text-left px-3 py-2 flex items-center gap-2 cursor-pointer ${
                          isSelected
                            ? styles.searchModal.selectedItem
                            : styles.searchModal.item
                        }`}
                        onClick={() =>
                          setCurrentDir(
                            currentDir === "."
                              ? entry.name
                              : `${currentDir}/${entry.name}`,
                          )
                        }
                        onMouseEnter={() => setSelectedIndex(index)}
                      >
                        <Folder className="w-4 h-4" />
                        <span>{entry.name}</span>
                      </button>
                    );
                  })}
                  {filteredEntries.files
                    .filter((entry) => isAllowedFile(entry.name))
                    .map((entry, fileIndex) => {
                      const baseIndex =
                        (onUpload ? 1 : 0) + filteredEntries.dirs.length;
                      const index = baseIndex + fileIndex;
                      const isSelected = selectedIndex === index;
                      return (
                        <div
                          key={`file-${entry.name}`}
                          className={`w-full px-3 py-2 flex items-center justify-between gap-2 cursor-pointer ${
                            isSelected
                              ? styles.searchModal.selectedItem
                              : styles.searchModal.item
                          }`}
                          onMouseEnter={(event) =>
                            handlePreviewEnter(entry.name, event)
                          }
                          onMouseOver={() => setSelectedIndex(index)}
                          onMouseMove={(event) =>
                            handlePreviewMove(entry.name, event)
                          }
                          onMouseLeave={handlePreviewLeave}
                        >
                          <button
                            type="button"
                            className="flex items-center gap-2 text-left flex-1"
                            onClick={() => handleSelectFile(entry.name)}
                            onMouseEnter={() => setSelectedIndex(index)}
                          >
                            <FileIcon className="w-4 h-4" />
                            <span>{entry.name}</span>
                          </button>
                          {onDelete && (
                            <Button
                              type="button"
                              className="inline-flex items-center justify-center w-8 h-8"
                              styles={styles}
                              onClick={(event) => {
                                event.stopPropagation();
                                handleDeleteFile(entry.name);
                              }}
                              aria-label={`Delete ${entry.name}`}
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  {!filteredEntries.dirs.length &&
                    !filteredEntries.files.filter((entry) =>
                      isAllowedFile(entry.name),
                    ).length && (
                      <div className="text-xs text-slate-500 px-3 py-2">
                        No files found.
                      </div>
                    )}
                </div>
              )}
            </div>
            <SearchModalFooter styles={styles} showDeleteHint={!!onDelete} />
          </div>
        </div>
      )}
      {preview && previewType !== "none" && (
        <div
          className="fixed pointer-events-none"
          style={{
            left: Math.min(preview.x + 16, window.innerWidth - 320),
            top: Math.min(preview.y + 16, window.innerHeight - 240),
            maxWidth: 300,
            zIndex: 9999,
          }}
        >
          <div className="rounded border border-slate-600 bg-slate-900/95 p-2 shadow-lg text-xs text-slate-200">
            {previewType === "image" && (
              <img
                src={resolvePreviewPath(preview.name)}
                alt={preview.name}
                className="max-h-48 w-auto rounded mb-1"
                onError={() => setPreviewError(preview.name)}
              />
            )}
            {previewType === "audio" && (
              <div className="w-72">
                <audio
                  ref={previewAudioRef}
                  src={resolvePreviewPath(preview.name)}
                  autoPlay
                  loop
                  preload="auto"
                  playsInline
                  onCanPlay={(event) => {
                    event.currentTarget
                      .play()
                      .then(() => setPreviewNeedsGesture(false))
                      .catch(() => setPreviewNeedsGesture(true));
                  }}
                  onPlay={() => {
                    setPreviewError(null);
                    setPreviewNeedsGesture(false);
                  }}
                  onError={() => setPreviewError(preview.name)}
                />
                {previewNeedsGesture && (
                  <button
                    type="button"
                    className="mt-1 w-full rounded border border-slate-600 bg-slate-800/80 px-2 py-1 text-xs text-slate-100"
                    onClick={() => {
                      previewAudioRef.current
                        ?.play()
                        .then(() => setPreviewNeedsGesture(false))
                        .catch(() => setPreviewError(preview.name));
                    }}
                  >
                    Play preview
                  </button>
                )}
              </div>
            )}
            <div className="truncate">{preview.name}</div>
            {previewError === preview.name && (
              <div className="text-rose-400 mt-1">Preview failed to load.</div>
            )}
          </div>
        </div>
      )}
      {onUpload && (
        <input
          ref={uploadInputRef}
          type="file"
          className="hidden"
          accept={uploadAccept}
          onChange={handleUploadSelect}
        />
      )}
    </div>
  );
}

export default PathInput;
