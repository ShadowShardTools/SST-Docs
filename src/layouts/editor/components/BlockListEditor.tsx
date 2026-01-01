import type React from "react";
import type { Content, StyleTheme } from "@shadow-shard-tools/docs-core";
import { ALIGNMENT_CLASSES } from "@shadow-shard-tools/docs-core";
import { GripVertical } from "lucide-react";
import { useMemo, useState } from "react";
import ContentBlockRenderer from "../../render/components/ContentBlockRenderer";
import { BLOCK_LABELS, DEFAULT_BLOCKS, type BlockType } from "../blocks";
import BlockToolbar from "./BlockToolbar";
import {
  EditableDivider,
  EditableList,
  EditableMessageBox,
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
  const blocks = useMemo(() => content ?? [], [content]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const addBlock = (type: BlockType) => {
    const template = DEFAULT_BLOCKS[type];
    onChange([...blocks, JSON.parse(JSON.stringify(template))]);
  };

  const removeBlock = (index: number) => {
    onChange(blocks.filter((_, i) => i !== index));
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
    <div className="space-y-6 text-sm">
      <div className="flex flex-wrap gap-2">
        {(Object.keys(BLOCK_LABELS) as BlockType[]).map((type) => (
          <button
            key={type}
            className="px-3 py-1.5 text-sm border rounded hover:bg-slate-100 dark:hover:bg-slate-800"
            onClick={() => addBlock(type)}
            type="button"
          >
            + {BLOCK_LABELS[type]}
          </button>
        ))}
      </div>

      {blocks.length === 0 ? (
        <p className="text-sm text-slate-500">No blocks yet. Add one above.</p>
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
              <div
                key={idx}
                className={`relative ring-offset-2 transition ${
                  isDragOver || isDragging
                    ? "ring-1 ring-sky-400 bg-slate-50/40 dark:bg-slate-800/40"
                    : ""
                }`}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragLeave={() => handleDragLeave(idx)}
                onDrop={(e) => handleDrop(e, idx)}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() =>
                  setHoveredIndex((prev) => (prev === idx ? null : prev))
                }
              >
                <BlockToolbar
                  block={block}
                  index={idx}
                  blocks={blocks}
                  onChange={onChange}
                  onRemove={removeBlock}
                  visible={hoveredIndex === idx}
                />
                <div className="flex gap-1 items-start">
                  <button
                    type="button"
                    className={`flex items-center justify-center px-2 h-8 rounded border border-transparent cursor-grab active:cursor-grabbing transition ${
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
                          listData.type === "ol" ? "list-decimal" : "list-disc",
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
            );
          })}
        </div>
      )}
    </div>
  );
}

export default BlockListEditor;
