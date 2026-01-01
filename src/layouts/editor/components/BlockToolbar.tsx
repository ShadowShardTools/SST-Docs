import type { Content } from "@shadow-shard-tools/docs-core";
import type { BlockType } from "../blocks";
import { BLOCK_LABELS } from "../blocks";
import {
  updateBlockAt,
  transformBlockAt,
  insertBlockAfter,
} from "./utils/blockTransforms";
import TitleToolbarControls from "./toolbars/TitleToolbarControls";
import TextToolbarControls from "./toolbars/TextToolbarControls";
import ListToolbarControls from "./toolbars/ListToolbarControls";
import DividerToolbarControls from "./toolbars/DividerToolbarControls";
import MessageBoxToolbarControls from "./toolbars/MessageBoxToolbarControls";
import TableToolbarControls from "./toolbars/TableToolbarControls";
import MathToolbarControls from "./toolbars/MathToolbarControls";
import CodeToolbarControls from "./toolbars/CodeToolbarControls";

interface Props {
  block: Content;
  index: number;
  blocks: Content[];
  onChange: (updated: Content[]) => void;
  onRemove: (index: number) => void;
  visible?: boolean;
}

export function BlockToolbar({
  block,
  index,
  blocks,
  onChange,
  onRemove,
  visible = false,
}: Props) {
  const handleTransform = (to: BlockType) => {
    onChange(transformBlockAt(blocks, index, to));
  };

  const handleInsert = (type: BlockType) => {
    onChange(insertBlockAfter(blocks, index, type));
  };

  const handleUpdate = (updater: (prev: Content) => Content) => {
    onChange(updateBlockAt(blocks, index, updater));
  };

  const renderInlineControls = () => {
    if (block.type === "title") {
      const data = (block as any).titleData ?? {};
      return <TitleToolbarControls data={data} onChange={handleUpdate} />;
    }

    if (block.type === "text") {
      const data = (block as any).textData ?? {};
      return <TextToolbarControls data={data} onChange={handleUpdate} />;
    }

    if (block.type === "list") {
      const data = (block as any).listData ?? {};
      return <ListToolbarControls data={data} onChange={handleUpdate} />;
    }

    if (block.type === "divider") {
      const data = (block as any).dividerData ?? {};
      return <DividerToolbarControls data={data} onChange={handleUpdate} />;
    }

    if (block.type === "messageBox") {
      const data = (block as any).messageBoxData ?? {};
      return <MessageBoxToolbarControls data={data} onChange={handleUpdate} />;
    }

    if (block.type === "table") {
      const data = (block as any).tableData ?? {};
      return <TableToolbarControls data={data} onChange={handleUpdate} />;
    }

    if (block.type === "math") {
      const data = (block as any).mathData ?? {};
      return <MathToolbarControls data={data} onChange={handleUpdate} />;
    }

    if (block.type === "code") {
      const data = (block as any).codeData ?? {};
      return <CodeToolbarControls data={data} onChange={handleUpdate} />;
    }

    return null;
  };

  return (
    <div
      className={`absolute -top-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 rounded-full border bg-white/95 dark:bg-slate-900/95 shadow-lg px-3 py-1 text-xs transition-opacity duration-150 ${
        visible
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      }`}
    >
      <label className="flex items-center gap-1">
        <span className="text-slate-500">Type</span>
        <select
          className="border rounded px-2 py-1 bg-white dark:bg-slate-800"
          value={block.type}
          onChange={(e) => handleTransform(e.target.value as BlockType)}
        >
          {(
            ["title", "text", "divider", "messageBox", "list", "table", "math", "code"] as BlockType[]
          ).map((t) => (
            <option key={t} value={t}>
              {BLOCK_LABELS[t] ?? t}
            </option>
          ))}
        </select>
      </label>
      {renderInlineControls()}
      <button
        type="button"
        className="px-2 py-1 border rounded hover:bg-slate-100 dark:hover:bg-slate-800"
        onClick={() => handleInsert("text")}
      >
        + Block
      </button>
      <button
        type="button"
        className="px-2 py-1 border rounded text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
        onClick={() => onRemove(index)}
      >
        Delete
      </button>
    </div>
  );
}

export default BlockToolbar;
