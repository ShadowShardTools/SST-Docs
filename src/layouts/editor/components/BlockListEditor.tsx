import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Content, StyleTheme } from "@shadow-shard-tools/docs-core";
import { BLOCK_LABELS, DEFAULT_BLOCKS, type BlockType } from "../blocks";
import {
  ALIGNMENT_CLASSES,
  SPACING_CLASSES,
} from "@shadow-shard-tools/docs-core";
import {
  GripVertical,
  Info,
  AlertTriangle,
  XCircle,
  CheckCircle,
  HelpCircle,
  LinkIcon,
} from "lucide-react";
import ContentBlockRenderer from "../../render/components/ContentBlockRenderer";
import BlockToolbar from "./BlockToolbar";
import { updateBlockAt } from "./utils/blockTransforms";

interface Props {
  content: Content[];
  onChange: (updated: Content[]) => void;
  styles: StyleTheme;
  currentPath?: string;
}

const EditableText = ({
  value,
  alignmentClass,
  textClass,
  onChange,
}: {
  value: string;
  alignmentClass: string;
  textClass: string;
  onChange: (next: string) => void;
}) => {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (ref.current && ref.current.innerText !== value) {
      ref.current.innerText = value ?? "";
    }
  }, [value]);

  return (
    <p
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      className={`${alignmentClass} ${textClass} ${SPACING_CLASSES.medium} bg-transparent outline-none min-h-[1.5rem] px-1.5 py-1.5 border border-transparent focus:border-sky-400 rounded`}
      style={{ whiteSpace: "pre-wrap" }}
      onInput={(e) => onChange((e.target as HTMLElement).innerText)}
    />
  );
};

const EditableTitle = ({
  value,
  level,
  alignmentClass,
  titleClasses,
  showAnchor,
  anchorClass,
  wrapperClass,
  onChange,
}: {
  value: string;
  level: number;
  alignmentClass: string;
  titleClasses: { 1: string; 2: string; 3: string };
  showAnchor?: boolean;
  anchorClass?: string;
  wrapperClass?: string;
  onChange: (next: string) => void;
}) => {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (ref.current && ref.current.innerText !== value) {
      ref.current.innerText = value ?? "";
    }
  }, [value]);

  const Heading = (["h1", "h2", "h3"] as const)[level - 1 > 0 ? level - 1 : 0];
  const levelClass = titleClasses[level as 1 | 2 | 3] ?? titleClasses[1];

  return (
    <div className={SPACING_CLASSES.none}>
      <div className={wrapperClass}>
        <Heading
          ref={ref}
          contentEditable
          suppressContentEditableWarning
          className={`${alignmentClass} ${levelClass} font-bold leading-tight scroll-mt-20 group relative bg-transparent outline-none border-0 focus:border-0 focus:ring-0 px-0 py-0`}
          onInput={(e) => onChange((e.target as HTMLElement).innerText)}
        >
          {value}
          {showAnchor && (
            <span
              contentEditable={false}
              className={`ml-2 inline-block ${anchorClass ?? ""}`}
            >
              <LinkIcon className="w-4 h-4" />
            </span>
          )}
        </Heading>
      </div>
    </div>
  );
};

const EditableMessageBox = ({
  data,
  textClass,
  onChange,
  typeClasses,
}: {
  data: any;
  textClass: string;
  onChange: (next: string) => void;
  typeClasses: Record<string, string>;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current && ref.current.innerText !== (data?.text ?? "")) {
      ref.current.innerText = data?.text ?? "";
    }
  }, [data?.text]);

  const type = data?.type ?? "neutral";
  const sizeClasses = "p-4 text-base";
  const typeStyles = {
    info: typeClasses.info,
    warning: typeClasses.warning,
    error: typeClasses.error,
    success: typeClasses.success,
    neutral: typeClasses.neutral,
    quote: typeClasses.quote,
  };
  const typeClass = typeStyles[type as keyof typeof typeStyles] ?? "";
  const showIcon = data?.showIcon ?? true;

  if (type === "quote") {
    return (
      <blockquote className={`pl-4 py-2 mb-4 ${typeStyles.quote ?? ""}`}>
        <div
          ref={ref}
          contentEditable
          suppressContentEditableWarning
          className={`outline-none bg-transparent italic leading-relaxed ${textClass}`}
          onInput={(e) => onChange((e.target as HTMLElement).innerText)}
        />
      </blockquote>
    );
  }

  const icon = (() => {
    switch (type) {
      case "info":
        return <Info className="w-5 h-5 mr-3 flex-shrink-0" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0" />;
      case "error":
        return <XCircle className="w-5 h-5 mr-3 flex-shrink-0" />;
      case "success":
        return <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />;
      case "neutral":
      default:
        return type === "neutral" ? (
          <HelpCircle className="w-5 h-5 mr-3 flex-shrink-0" />
        ) : null;
    }
  })();

  return (
    <div className="mb-4">
      <div className={`rounded-lg border ${sizeClasses} ${typeClass}`}>
        <div className="flex items-center gap-3">
          {showIcon && icon}
          <div className="flex-1">
            <div
              ref={ref}
              contentEditable
              suppressContentEditableWarning
              className={`outline-none bg-transparent ${textClass}`}
              onInput={(e) => onChange((e.target as HTMLElement).innerText)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const EditableDivider = ({
  data,
  styles,
  onChange,
}: {
  data: any;
  styles: StyleTheme;
  onChange: (next: string) => void;
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (ref.current && ref.current.innerText !== (data?.text ?? "")) {
      ref.current.innerText = data?.text ?? "";
    }
  }, [data?.text]);

  const spacing = "mb-6";
  const base = `w-full ${styles.divider.border || "sst-divider-border"}`;
  const dividerClass = (() => {
    switch (data?.type) {
      case "line":
        return `${base} border-t`;
      case "dashed":
        return `${base} border-t-2 border-dashed`;
      case "dotted":
        return `${base} border-t-2 border-dotted`;
      case "double":
        return `${base} border-t-4 border-double`;
      case "thick":
        return `${base} border-t-2`;
      case "gradient":
        return `bg-gradient-to-r ${styles.divider.gradient} h-px w-full`;
      default:
        return `${base} border-t`;
    }
  })();

  if (data?.text) {
    const side = dividerClass.replace("w-full", "flex-1");
    return (
      <div className={`${spacing} flex items-center`}>
        <div className={side} />
        <span
          ref={ref}
          className={`px-4 ${styles.divider.text || "sst-divider-text"}`}
          contentEditable
          suppressContentEditableWarning
          onInput={(e) => onChange((e.target as HTMLElement).innerText)}
        />
        <div className={side} />
      </div>
    );
  }
  return (
    <div className={spacing}>
      <div className={dividerClass} />
    </div>
  );
};

const EditableListItem = ({
  value,
  onChange,
  onKeyDown,
  innerRef,
}: {
  value: string;
  onChange: (next: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  innerRef: (el: HTMLDivElement | null) => void;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && ref.current.innerText !== (value ?? "")) {
      ref.current.innerText = value ?? "";
    }
  }, [value]);

  return (
    <div
      ref={(el) => {
        ref.current = el;
        innerRef(el);
      }}
      contentEditable
      suppressContentEditableWarning
      className="inline outline-none bg-transparent leading-6 min-h-[1.25rem] align-middle"
      onInput={(e) => onChange((e.target as HTMLElement).innerText)}
      onKeyDown={onKeyDown}
    />
  );
};

const EditableList = ({
  data,
  listClass,
  onChange,
}: {
  data: any;
  listClass: string;
  onChange: (items: string[]) => void;
}) => {
  const items: string[] = (data?.items ?? []).length ? data.items : [""];
  const Tag = (data?.type === "ol" ? "ol" : "ul") as "ol" | "ul";
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const focusItem = (index: number, placeAtEnd = true) => {
    requestAnimationFrame(() => {
      const target = itemRefs.current[index];
      if (!target) return;
      target.focus();
      const range = document.createRange();
      range.selectNodeContents(target);
      range.collapse(placeAtEnd);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    });
  };

  const handleItemChange = (index: number, text: string) => {
    const next = [...items];
    next[index] = text;
    onChange(next);
  };

  const handleSplit = (index: number) => {
    const target = itemRefs.current[index];
    const text = target?.innerText ?? items[index] ?? "";
    const selection = window.getSelection();
    let offset = text.length;
    if (
      selection &&
      selection.rangeCount > 0 &&
      target?.contains(selection.anchorNode)
    ) {
      const range = selection.getRangeAt(0);
      const preRange = range.cloneRange();
      preRange.selectNodeContents(target);
      preRange.setEnd(range.endContainer, range.endOffset);
      offset = preRange.toString().length;
    }
    const before = text.slice(0, offset);
    const after = text.slice(offset);

    const next = [...items];
    next[index] = before;
    next.splice(index + 1, 0, after);
    onChange(next);
    focusItem(index + 1, false);
  };

  const handleRemove = (index: number) => {
    if (items.length <= 1) {
      onChange([""]);
      focusItem(0, true);
      return;
    }
    const next = [...items];
    next.splice(index, 1);
    onChange(next);
    focusItem(Math.max(index - 1, 0), true);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLDivElement>,
    index: number,
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSplit(index);
      return;
    }

    if (e.key === "Backspace") {
      const content = (e.currentTarget as HTMLElement).innerText;
      const isEmpty = !content || content.trim().length === 0;
      const selection = window.getSelection();
      const isAtStart =
        selection?.anchorOffset === 0 && selection?.focusOffset === 0;
      if (isEmpty && (isAtStart || selection?.isCollapsed)) {
        e.preventDefault();
        handleRemove(index);
      }
    }
  };

  return (
    <div className="bg-transparent border border-transparent focus-within:border-sky-400 rounded px-1.5 py-1.5">
      <Tag
        className={`${listClass} space-y-1`}
        role="list"
        aria-label={data?.ariaLabel}
        {...(Tag === "ol" && data?.startNumber !== undefined
          ? { start: data.startNumber }
          : {})}
      >
        {items.map((item, i) => (
          <li key={i} role="listitem">
            <EditableListItem
              value={item}
              innerRef={(el) => {
                itemRefs.current[i] = el;
              }}
              onChange={(next) => handleItemChange(i, next)}
              onKeyDown={(e) => handleKeyDown(e, i)}
            />
          </li>
        ))}
      </Tag>
    </div>
  );
};

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
                  isDragOver || isDragging ? "ring-1 ring-sky-400 bg-slate-50/40 dark:bg-slate-800/40" : ""
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
