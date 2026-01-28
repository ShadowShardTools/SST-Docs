import { useEffect, useRef } from "react";
import { FileText, FolderPlus, Plus } from "lucide-react";
import type { StyleTheme } from "@shadow-shard-tools/docs-core";

interface EditorNavigationAddMenuProps {
  label: string;
  activeKey: string;
  addMenuFor: string | null;
  setAddMenuFor: (key: string | null) => void;
  onCreateCategory: () => void;
  onCreateDoc: () => void;
  styles: StyleTheme;
  highlight?: boolean;
  docOnly?: boolean;
  categoryOnly?: boolean;
}

export function EditorNavigationAddMenu({
  label,
  activeKey,
  addMenuFor,
  setAddMenuFor,
  onCreateCategory,
  onCreateDoc,
  styles,
  highlight = false,
  docOnly = false,
  categoryOnly = false,
}: EditorNavigationAddMenuProps) {
  const open = addMenuFor === activeKey;
  const ref = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    if (docOnly) {
      onCreateDoc();
      return;
    }
    if (categoryOnly) {
      onCreateCategory();
      return;
    }
    setAddMenuFor(open ? null : activeKey);
  };

  useEffect(() => {
    if (!open) return;
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (ref.current && !ref.current.contains(target)) {
        setAddMenuFor(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [open, setAddMenuFor]);

  return (
    <div className="relative w-full" ref={ref}>
      <button
        type="button"
        aria-label={label}
        className="group relative w-full h-4 flex items-center justify-center"
        onClick={handleClick}
      >
        <span
          className={`absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 transition-colors ${
            highlight ? "bg-sky-400" : "bg-slate-500/30 dark:bg-slate-400/20"
          }`}
        />
        <span
          className={`relative z-10 inline-flex items-center justify-center w-12 h-6 rounded-full border transition-all ${
            styles.buttons.common
          } ${highlight ? "!border-sky-400 !text-sky-200" : ""} ${
            open
              ? "opacity-100 scale-100"
              : "opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100"
          }`}
        >
          <Plus className="w-4 h-4" />
        </span>
      </button>
      {!docOnly && !categoryOnly && open && (
        <div
          className={`absolute left-1/2 -translate-x-1/2 z-20 mt-2 min-w-[160px] ${styles.dropdown.container}`}
        >
          <button
            type="button"
            className={`w-full text-left px-3 py-2 flex items-center gap-2 cursor-pointer ${styles.dropdown.item}`}
            onClick={() => {
              setAddMenuFor(null);
              onCreateCategory();
            }}
          >
            <FolderPlus className="w-4 h-4" />
            Category
          </button>
          <button
            type="button"
            className={`w-full text-left px-3 py-2 flex items-center gap-2 cursor-pointer ${styles.dropdown.item}`}
            onClick={() => {
              setAddMenuFor(null);
              onCreateDoc();
            }}
          >
            <FileText className="w-4 h-4" />
            Document
          </button>
        </div>
      )}
    </div>
  );
}
