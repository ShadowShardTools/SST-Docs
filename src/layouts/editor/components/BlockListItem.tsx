import type { Content, StyleTheme } from "@shadow-shard-tools/docs-core";
import type { DragEvent } from "react";
import { GripVertical, Wrench } from "lucide-react";
import Button from "../../common/components/Button";
import BlockToolbar from "./BlockToolbar";
import { BlockEditorContent } from "./BlockEditorContent";

interface BlockListItemProps {
  block: Content;
  index: number;
  blocks: Content[];
  styles: StyleTheme;
  currentPath: string;
  dragIndex: number | null;
  dragOverIndex: number | null;
  onDragStart: (event: DragEvent<HTMLElement>, index: number) => void;
  onDragOver: (event: DragEvent<HTMLElement>, index: number) => void;
  onDragLeave: (index: number) => void;
  onDrop: (event: DragEvent<HTMLElement>, index: number) => void;
  onDragEnd: () => void;
  hoveredIndex: number | null;
  expandedIndex: number | null;
  onHoverChange: (index: number, isHovered: boolean) => void;
  onToggleExpanded: (index: number) => void;
  onChange: (updated: Content[]) => void;
  onRemove: (index: number) => void;
}

export function BlockListItem({
  block,
  index,
  blocks,
  styles,
  currentPath,
  dragIndex,
  dragOverIndex,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  hoveredIndex,
  expandedIndex,
  onHoverChange,
  onToggleExpanded,
  onChange,
  onRemove,
}: BlockListItemProps) {
  const isDragOver = dragOverIndex === index;
  const isDragging = dragIndex === index;
  const showToolbar = hoveredIndex === index || expandedIndex === index;

  return (
    <div
      className={`relative ring-offset-2 transition ${
        isDragOver || isDragging
          ? "ring-1 ring-sky-400 bg-slate-50/40 dark:bg-slate-800/40"
          : ""
      }`}
      onDragOver={(event) => onDragOver(event, index)}
      onDragLeave={() => onDragLeave(index)}
      onDrop={(event) => onDrop(event, index)}
    >
      <div className="flex gap-1 items-start">
        <div className="flex items-start gap-1">
          <Button
            type="button"
            className="flex items-center justify-center px-2 h-8 cursor-grab active:cursor-grabbing"
            styles={styles}
            draggable
            aria-grabbed={isDragging}
            onDragStart={(event) => onDragStart(event, index)}
            onDragEnd={onDragEnd}
            title="Drag to reorder"
          >
            <GripVertical className="w-3 h-3" />
          </Button>
          <div className="relative flex flex-col items-start">
            <Button
              type="button"
              className="flex items-center justify-center px-2 h-8 text-xs"
              styles={styles}
              variant={expandedIndex === index ? "tabActive" : "tab"}
              onClick={() => onToggleExpanded(index)}
              onMouseEnter={() => onHoverChange(index, true)}
              onMouseLeave={() => onHoverChange(index, false)}
              title="Show options"
            >
              <Wrench className="w-3 h-3" />
            </Button>

            <BlockToolbar
              block={block}
              index={index}
              blocks={blocks}
              onChange={onChange}
              onRemove={onRemove}
              styles={styles}
              visible={showToolbar}
            />
          </div>
        </div>

        <div className="flex-1 min-w-0 space-y-3">
          <BlockEditorContent
            block={block}
            index={index}
            blocks={blocks}
            styles={styles}
            currentPath={currentPath}
            onChange={onChange}
          />
        </div>
      </div>
    </div>
  );
}
