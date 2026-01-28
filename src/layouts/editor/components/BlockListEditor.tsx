import type { Content, StyleTheme } from "@shadow-shard-tools/docs-core";
import { useMemo, useState } from "react";
import { DEFAULT_BLOCKS, type BlockType } from "../blocks";
import { BlockInsertControl } from "./BlockInsertControl";
import { BlockListItem } from "./BlockListItem";
import { useBlockDragState } from "./utils/useBlockDragState";

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
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const {
    dragIndex,
    dragOverIndex,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    resetDrag,
  } = useBlockDragState(blocks, onChange);

  const insertBlockAt = (index: number, type: BlockType) => {
    const template = DEFAULT_BLOCKS[type];
    const next = [...blocks];
    next.splice(index, 0, JSON.parse(JSON.stringify(template)));
    onChange(next);
  };

  const removeBlock = (index: number) => {
    onChange(blocks.filter((_, i) => i !== index));
  };

  const handleHoverChange = (index: number, isHovered: boolean) => {
    setHoveredIndex((prev) =>
      isHovered ? index : prev === index ? null : prev,
    );
  };

  const handleToggleExpanded = (index: number) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="space-y-6 text-sm px-2 md:px-4">
      {blocks.length === 0 ? (
        <div className="flex flex-col items-center gap-3 text-sm text-slate-500">
          <p>No blocks yet</p>
          <BlockInsertControl
            position={0}
            fullWidth
            styles={styles}
            onInsert={insertBlockAt}
          />
        </div>
      ) : (
        <div>
          {blocks.map((block, idx) => {
            return (
              <div key={idx}>
                <BlockInsertControl
                  position={idx}
                  styles={styles}
                  onInsert={insertBlockAt}
                />
                <BlockListItem
                  block={block}
                  index={idx}
                  blocks={blocks}
                  styles={styles}
                  currentPath={currentPath}
                  dragIndex={dragIndex}
                  dragOverIndex={dragOverIndex}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onDragEnd={resetDrag}
                  hoveredIndex={hoveredIndex}
                  expandedIndex={expandedIndex}
                  onHoverChange={handleHoverChange}
                  onToggleExpanded={handleToggleExpanded}
                  onChange={onChange}
                  onRemove={removeBlock}
                />
              </div>
            );
          })}
          <BlockInsertControl
            position={blocks.length}
            styles={styles}
            onInsert={insertBlockAt}
          />
        </div>
      )}
    </div>
  );
}

export default BlockListEditor;
