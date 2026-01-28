import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { StyleTheme } from "@shadow-shard-tools/docs-core";
import {
  BarChart2,
  Code,
  Columns2,
  FunctionSquare,
  Heading,
  Image as ImageIcon,
  Images,
  LayoutGrid,
  List as ListIcon,
  MessageSquare,
  Minus,
  Music2,
  Plus,
  Table as TableIcon,
  Text as TextIcon,
  Youtube,
} from "lucide-react";
import type { BlockType } from "../blocks";
import { BLOCK_LABELS } from "../blocks";
import Button from "../../common/components/Button";

const BLOCK_ICONS: Record<BlockType, ReactNode> = {
  title: <Heading className="w-4 h-4" />,
  text: <TextIcon className="w-4 h-4" />,
  list: <ListIcon className="w-4 h-4" />,
  table: <TableIcon className="w-4 h-4" />,
  messageBox: <MessageSquare className="w-4 h-4" />,
  divider: <Minus className="w-4 h-4" />,
  image: <ImageIcon className="w-4 h-4" />,
  imageCompare: <Columns2 className="w-4 h-4" />,
  imageCarousel: <Images className="w-4 h-4" />,
  imageGrid: <LayoutGrid className="w-4 h-4" />,
  audio: <Music2 className="w-4 h-4" />,
  youtube: <Youtube className="w-4 h-4" />,
  math: <FunctionSquare className="w-4 h-4" />,
  code: <Code className="w-4 h-4" />,
  chart: <BarChart2 className="w-4 h-4" />,
};

interface BlockInsertControlProps {
  position: number;
  styles: StyleTheme;
  onInsert: (position: number, type: BlockType) => void;
  fullWidth?: boolean;
}

export function BlockInsertControl({
  position,
  styles,
  onInsert,
  fullWidth = false,
}: BlockInsertControlProps) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const showButton = hovered || open;
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [openAbove, setOpenAbove] = useState(false);

  useEffect(() => {
    if (!open) return;
    const menuHeight =
      dropdownRef.current?.getBoundingClientRect().height ?? 256;
    const triggerRect = triggerRef.current?.getBoundingClientRect();
    if (triggerRect) {
      const belowSpace = window.innerHeight - triggerRect.bottom;
      setOpenAbove(belowSpace < menuHeight + 12);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        dropdownRef.current &&
        triggerRef.current &&
        !dropdownRef.current.contains(target) &&
        !triggerRef.current.contains(target)
      ) {
        setOpen(false);
        setHovered(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div
      className={`group relative my-1 flex items-center justify-center ${
        fullWidth ? "w-full" : ""
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
      }}
    >
      <span
        className={`absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 transition-colors ${
          showButton ? "bg-slate-500/50" : "bg-slate-500/20"
        }`}
      />
      <Button
        type="button"
        className={`relative z-10 inline-flex items-center justify-center w-12 h-6 cursor-pointer ${
          showButton
            ? "opacity-100 scale-100"
            : "opacity-0 scale-75 pointer-events-none group-hover:opacity-100 group-hover:scale-100"
        }`}
        styles={styles}
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Add block"
        ref={triggerRef}
      >
        <Plus className="w-4 h-4" />
      </Button>
      {open && (
        <div
          ref={dropdownRef}
          className={`absolute left-1/2 -translate-x-1/2 z-20 min-w-[180px] max-h-64 overflow-y-auto ${styles.dropdown.container}`}
          style={openAbove ? { bottom: "2.5rem" } : { top: "2.5rem" }}
        >
          {(Object.keys(BLOCK_LABELS) as BlockType[]).map((type) => (
            <button
              key={type}
              type="button"
              className={`w-full text-left px-3 py-2 flex items-center gap-2 cursor-pointer ${styles.dropdown.item}`}
              onClick={() => {
                onInsert(position, type);
                setOpen(false);
                setHovered(false);
              }}
            >
              {BLOCK_ICONS[type]}
              <span>{BLOCK_LABELS[type]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
