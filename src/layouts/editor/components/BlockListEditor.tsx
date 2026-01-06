import type React from "react";
import type { Content, StyleTheme } from "@shadow-shard-tools/docs-core";
import { ALIGNMENT_CLASSES } from "@shadow-shard-tools/docs-core";
import {
  GripVertical,
  Wrench,
  Plus,
  Heading,
  Text as TextIcon,
  List as ListIcon,
  Table as TableIcon,
  MessageSquare,
  Minus,
  Image as ImageIcon,
  Columns2,
  Images,
  LayoutGrid,
  Music2,
  Youtube,
  FunctionSquare,
  Code,
  BarChart2,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import ContentBlockRenderer from "../../render/components/ContentBlockRenderer";
import { BLOCK_LABELS, DEFAULT_BLOCKS, type BlockType } from "../blocks";
import BlockToolbar from "./BlockToolbar";
import {
  EditableDivider,
  EditableList,
  EditableMessageBox,
  EditableMath,
  EditableCode,
  EditableChart,
  EditableAudio,
  EditableImage,
  EditableImageCompare,
  EditableImageCarousel,
  EditableImageGrid,
  EditableYoutube,
  EditableTable,
  EditableText,
  EditableTitle,
} from "./editable";
import { updateBlockAt } from "./utils/blockTransforms";

interface Props {
  content: Content[];
  onChange: (updated: Content[]) => void;
  styles: StyleTheme;
  currentPath?: string;
}

export function BlockListEditor({
  content,
  onChange,
  styles,
  currentPath = "editor",
}: Props) {
  const blockIcons: Record<BlockType, React.ReactNode> = {
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

  const blocks = useMemo(() => content ?? [], [content]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const showToolbar = (idx: number) =>
    hoveredIndex === idx || expandedIndex === idx;

  const insertBlockAt = (index: number, type: BlockType) => {
    const template = DEFAULT_BLOCKS[type];
    const next = [...blocks];
    next.splice(index, 0, JSON.parse(JSON.stringify(template)));
    onChange(next);
  };

  const removeBlock = (index: number) => {
    onChange(blocks.filter((_, i) => i !== index));
  };

  const InsertControl: React.FC<{ position: number; fullWidth?: boolean }> = ({
    position,
    fullWidth = false,
  }) => {
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
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);
    return (
      <div
        className={`group relative my-1 flex items-center justify-center ${fullWidth ? "w-full" : ""}`}
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
        <button
          type="button"
          className={`relative z-10 inline-flex items-center justify-center w-12 h-6 rounded-full border transition-all ${
            styles.buttons.common
          } ${
            showButton
              ? "opacity-100 scale-100"
              : "opacity-0 scale-75 pointer-events-none group-hover:opacity-100 group-hover:scale-100"
          }`}
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Add block"
          ref={triggerRef}
        >
          <Plus className="w-4 h-4" />
        </button>
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
                className={`w-full text-left px-3 py-2 flex items-center gap-2 ${styles.dropdown.item}`}
                onClick={() => {
                  insertBlockAt(position, type);
                  setOpen(false);
                  setHovered(false);
                }}
              >
                {blockIcons[type]}
                <span>{BLOCK_LABELS[type]}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const moveBlock = (from: number, to: number) => {
    if (to < 0 || to >= blocks.length) return;
    const next = [...blocks];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(index));
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = (index: number) => {
    if (dragOverIndex === index) setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    const from =
      dragIndex !== null
        ? dragIndex
        : Number(e.dataTransfer.getData("text/plain"));
    if (!Number.isNaN(from)) {
      moveBlock(from, index);
    }
    setDragIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="space-y-6 text-sm px-2 md:px-4">
      {blocks.length === 0 ? (
        <div className="flex flex-col items-center gap-3 text-sm text-slate-500">
          <p>No blocks yet</p>
          <InsertControl position={0} fullWidth />
        </div>
      ) : (
        <div>
          {blocks.map((block, idx) => {
            const isDragOver = dragOverIndex === idx;
            const isDragging = dragIndex === idx;
            const textData = (block as any).textData ?? {};
            const titleData = (block as any).titleData ?? {};
            const listData = (block as any).listData ?? {};
            const dividerData = (block as any).dividerData ?? {};
            const titleAlign = (titleData.alignment ??
              "left") as keyof typeof ALIGNMENT_CLASSES;
            return (
              <div key={idx}>
                <InsertControl position={idx} />
                <div
                  className={`relative ring-offset-2 transition ${
                    isDragOver || isDragging
                      ? "ring-1 ring-sky-400 bg-slate-50/40 dark:bg-slate-800/40"
                      : ""
                  }`}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDragLeave={() => handleDragLeave(idx)}
                  onDrop={(e) => handleDrop(e, idx)}
                >
                  <div className="flex gap-1 items-start">
                    <div className="flex items-start gap-1">
                      <button
                        type="button"
                        className={`flex items-center justify-center px-2 h-8 rounded cursor-grab active:cursor-grabbing transition ${
                          isDragging
                            ? "bg-sky-100 dark:bg-slate-700 border-sky-300"
                            : "hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                        draggable
                        aria-grabbed={isDragging}
                        onDragStart={(e) => handleDragStart(e, idx)}
                        onDragEnd={() => {
                          setDragIndex(null);
                          setDragOverIndex(null);
                        }}
                        title="Drag to reorder"
                      >
                        <GripVertical className="w-3 h-3" />
                      </button>
                      <div className="relative flex flex-col items-start">
                        <button
                          type="button"
                          className={`flex items-center justify-center px-2 h-8 rounded text-xs transition ${
                            showToolbar(idx)
                              ? "bg-sky-100 dark:bg-slate-700 border-sky-300"
                              : "hover:bg-slate-100 dark:hover:bg-slate-800"
                          }`}
                          onClick={() =>
                            setExpandedIndex((prev) =>
                              prev === idx ? null : idx,
                            )
                          }
                          onMouseEnter={() => setHoveredIndex(idx)}
                          onMouseLeave={() =>
                            setHoveredIndex((prev) =>
                              prev === idx ? null : prev,
                            )
                          }
                          title="Show options"
                        >
                          <Wrench className="w-3 h-3" />
                        </button>

                        <BlockToolbar
                          block={block}
                          index={idx}
                          blocks={blocks}
                          onChange={onChange}
                          onRemove={removeBlock}
                          styles={styles}
                          visible={showToolbar(idx)}
                        />
                      </div>
                    </div>

                    <div className="flex-1 space-y-3">
                      {block.type === "text" ? (
                        <EditableText
                          value={textData.text ?? ""}
                          alignmentClass={
                            ALIGNMENT_CLASSES[
                              (textData.alignment ??
                                "left") as keyof typeof ALIGNMENT_CLASSES
                            ].text
                          }
                          textClass={styles.text.general}
                          onChange={(next) =>
                            onChange(
                              updateBlockAt(blocks, idx, (prev) => ({
                                ...prev,
                                textData: {
                                  ...(prev as any).textData,
                                  text: next,
                                },
                              })),
                            )
                          }
                        />
                      ) : block.type === "title" ? (
                        <EditableTitle
                          value={titleData.text ?? ""}
                          level={titleData.level ?? 1}
                          alignmentClass={ALIGNMENT_CLASSES[titleAlign].text}
                          wrapperClass={styles.sections.contentBackground || ""}
                          titleClasses={{
                            1: styles.text.titleLevel1 || "text-4xl",
                            2: styles.text.titleLevel2 || "text-3xl",
                            3: styles.text.titleLevel3 || "text-2xl",
                          }}
                          showAnchor={!!titleData.enableAnchorLink}
                          anchorClass={styles.text.titleAnchor}
                          onChange={(next) =>
                            onChange(
                              updateBlockAt(blocks, idx, (prev) => ({
                                ...prev,
                                titleData: {
                                  ...(prev as any).titleData,
                                  text: next,
                                },
                              })),
                            )
                          }
                        />
                      ) : block.type === "messageBox" ? (
                        <EditableMessageBox
                          data={(block as any).messageBoxData}
                          textClass={styles.text.general}
                          typeClasses={
                            styles.messageBox as Record<string, string>
                          }
                          onChange={(next) =>
                            onChange(
                              updateBlockAt(blocks, idx, (prev) => ({
                                ...prev,
                                messageBoxData: {
                                  ...(prev as any).messageBoxData,
                                  text: next,
                                },
                              })),
                            )
                          }
                        />
                      ) : block.type === "table" ? (
                        <EditableTable
                          data={(block as any).tableData}
                          styles={styles}
                          onChange={(nextTableData) =>
                            onChange(
                              updateBlockAt(blocks, idx, (prev) => ({
                                ...prev,
                                tableData: {
                                  ...(prev as any).tableData,
                                  ...nextTableData,
                                },
                              })),
                            )
                          }
                        />
                      ) : block.type === "divider" ? (
                        <EditableDivider
                          data={dividerData}
                          styles={styles}
                          onChange={(next) =>
                            onChange(
                              updateBlockAt(blocks, idx, (prev) => ({
                                ...prev,
                                dividerData: {
                                  ...(prev as any).dividerData,
                                  text: next,
                                },
                              })),
                            )
                          }
                        />
                      ) : block.type === "list" ? (
                        <EditableList
                          data={listData}
                          listClass={[
                            styles.text.list,
                            listData.type === "ol"
                              ? "list-decimal"
                              : "list-disc",
                            listData.inside ? "ml-4" : "",
                            ALIGNMENT_CLASSES[
                              (listData.alignment ??
                                "left") as keyof typeof ALIGNMENT_CLASSES
                            ].text,
                          ]
                            .filter(Boolean)
                            .join(" ")}
                          onChange={(items) =>
                            onChange(
                              updateBlockAt(blocks, idx, (prev) => ({
                                ...prev,
                                listData: { ...(prev as any).listData, items },
                              })),
                            )
                          }
                        />
                      ) : block.type === "chart" ? (
                        <EditableChart
                          data={(block as any).chartData}
                          styles={styles}
                          onChange={(nextChart) =>
                            onChange(
                              updateBlockAt(blocks, idx, (prev) => ({
                                ...prev,
                                chartData: {
                                  ...(prev as any).chartData,
                                  ...nextChart,
                                },
                              })),
                            )
                          }
                        />
                      ) : block.type === "audio" ? (
                        <EditableAudio
                          data={(block as any).audioData}
                          styles={styles}
                          onChange={(nextAudio) =>
                            onChange(
                              updateBlockAt(blocks, idx, (prev) => ({
                                ...prev,
                                audioData: {
                                  ...(prev as any).audioData,
                                  ...nextAudio,
                                },
                              })),
                            )
                          }
                        />
                      ) : block.type === "image" ? (
                        <EditableImage
                          data={(block as any).imageData}
                          styles={styles}
                          onChange={(nextImage) =>
                            onChange(
                              updateBlockAt(blocks, idx, (prev) => ({
                                ...prev,
                                imageData: {
                                  ...(prev as any).imageData,
                                  ...nextImage,
                                },
                              })),
                            )
                          }
                        />
                      ) : block.type === "imageCompare" ? (
                        <EditableImageCompare
                          data={(block as any).imageCompareData}
                          styles={styles}
                          onChange={(nextCompare) =>
                            onChange(
                              updateBlockAt(blocks, idx, (prev) => ({
                                ...prev,
                                imageCompareData: {
                                  ...(prev as any).imageCompareData,
                                  ...nextCompare,
                                },
                              })),
                            )
                          }
                        />
                      ) : block.type === "imageCarousel" ? (
                        <EditableImageCarousel
                          data={(block as any).imageCarouselData}
                          styles={styles}
                          onChange={(nextCarousel) =>
                            onChange(
                              updateBlockAt(blocks, idx, (prev) => ({
                                ...prev,
                                imageCarouselData: {
                                  ...(prev as any).imageCarouselData,
                                  ...nextCarousel,
                                },
                              })),
                            )
                          }
                        />
                      ) : block.type === "imageGrid" ? (
                        <EditableImageGrid
                          data={(block as any).imageGridData}
                          styles={styles}
                          onChange={(nextGrid) =>
                            onChange(
                              updateBlockAt(blocks, idx, (prev) => ({
                                ...prev,
                                imageGridData: {
                                  ...(prev as any).imageGridData,
                                  ...nextGrid,
                                },
                              })),
                            )
                          }
                        />
                      ) : block.type === "youtube" ? (
                        <EditableYoutube
                          data={(block as any).youtubeData}
                          styles={styles}
                          onChange={(nextYoutube) =>
                            onChange(
                              updateBlockAt(blocks, idx, (prev) => ({
                                ...prev,
                                youtubeData: {
                                  ...(prev as any).youtubeData,
                                  ...nextYoutube,
                                },
                              })),
                            )
                          }
                        />
                      ) : block.type === "code" ? (
                        <EditableCode
                          data={(block as any).codeData}
                          styles={styles}
                          onChange={(nextCode) =>
                            onChange(
                              updateBlockAt(blocks, idx, (prev) => ({
                                ...prev,
                                codeData: {
                                  ...(prev as any).codeData,
                                  ...nextCode,
                                },
                              })),
                            )
                          }
                        />
                      ) : block.type === "math" ? (
                        <EditableMath
                          data={(block as any).mathData}
                          styles={styles}
                          onChange={(nextMath) =>
                            onChange(
                              updateBlockAt(blocks, idx, (prev) => ({
                                ...prev,
                                mathData: {
                                  ...(prev as any).mathData,
                                  ...nextMath,
                                },
                              })),
                            )
                          }
                        />
                      ) : (
                        <ContentBlockRenderer
                          styles={styles}
                          content={[block]}
                          currentPath={currentPath}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <InsertControl position={blocks.length} />
        </div>
      )}
    </div>
  );
}

export default BlockListEditor;
