import { useMemo } from "react";
import type { Content } from "@shadow-shard-tools/docs-core";
import { BLOCK_LABELS, DEFAULT_BLOCKS, type BlockType } from "../blocks";
import { BlockFormRenderer } from "../blocks/BlockFormRenderer";

interface Props {
  content: Content[];
  onChange: (updated: Content[]) => void;
}

export function BlockListEditor({ content, onChange }: Props) {
  const blocks = useMemo(() => content ?? [], [content]);

  const updateBlock = (index: number, updated: Content) => {
    const next = [...blocks];
    next[index] = updated;
    onChange(next);
  };

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

  return (
    <div className="space-y-6">
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
        <div className="space-y-4">
          {blocks.map((block, idx) => (
            <div
              key={idx}
              className="border rounded p-4 bg-white dark:bg-slate-900 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-semibold">
                  {idx + 1}. {BLOCK_LABELS[block.type] ?? block.type}
                </div>
                <div className="flex gap-2">
                  <button
                    className="px-2 py-1 text-xs border rounded"
                    onClick={() => moveBlock(idx, idx - 1)}
                    type="button"
                    disabled={idx === 0}
                  >
                    ↑
                  </button>
                  <button
                    className="px-2 py-1 text-xs border rounded"
                    onClick={() => moveBlock(idx, idx + 1)}
                    type="button"
                    disabled={idx === blocks.length - 1}
                  >
                    ↓
                  </button>
                  <button
                    className="px-2 py-1 text-xs border rounded text-red-600"
                    onClick={() => removeBlock(idx)}
                    type="button"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <BlockFormRenderer block={block} onChange={(b) => updateBlock(idx, b)} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BlockListEditor;
