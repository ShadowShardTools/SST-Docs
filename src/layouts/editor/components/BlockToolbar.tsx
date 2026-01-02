import type { Content, StyleTheme } from "@shadow-shard-tools/docs-core";
import type { BlockType } from "../blocks";
import { BLOCK_LABELS } from "../blocks";
import {
  updateBlockAt,
  transformBlockAt,
  insertBlockAfter,
} from "./utils/blockTransforms";
import Dropdown from "../../common/components/Dropdown";
import TitleToolbarControls from "./toolbars/TitleToolbarControls";
import TextToolbarControls from "./toolbars/TextToolbarControls";
import ListToolbarControls from "./toolbars/ListToolbarControls";
import DividerToolbarControls from "./toolbars/DividerToolbarControls";
import MessageBoxToolbarControls from "./toolbars/MessageBoxToolbarControls";
import TableToolbarControls from "./toolbars/TableToolbarControls";
import MathToolbarControls from "./toolbars/MathToolbarControls";
import CodeToolbarControls from "./toolbars/CodeToolbarControls";
import ChartToolbarControls from "./toolbars/ChartToolbarControls";
import ImageToolbarControls from "./toolbars/ImageToolbarControls";
import ImageCompareToolbarControls from "./toolbars/ImageCompareToolbarControls";
import ImageCarouselToolbarControls from "./toolbars/ImageCarouselToolbarControls";
import ImageGridToolbarControls from "./toolbars/ImageGridToolbarControls";
import YoutubeToolbarControls from "./toolbars/YoutubeToolbarControls";

interface Props {
  block: Content;
  index: number;
  blocks: Content[];
  onChange: (updated: Content[]) => void;
  onRemove: (index: number) => void;
  visible?: boolean;
  styles: StyleTheme;
}

export function BlockToolbar({
  block,
  index,
  blocks,
  onChange,
  onRemove,
  visible = false,
  styles,
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

  const typeOptions = [
    "title",
    "text",
    "divider",
    "messageBox",
    "list",
    "table",
    "math",
    "code",
    "chart",
    "audio",
    "image",
    "imageCompare",
    "imageCarousel",
    "imageGrid",
    "youtube",
  ] as BlockType[];

  const renderInlineControls = () => {
    if (block.type === "title") {
      const data = (block as any).titleData ?? {};
      return <TitleToolbarControls data={data} onChange={handleUpdate} styles={styles} />;
    }

    if (block.type === "text") {
      const data = (block as any).textData ?? {};
      return <TextToolbarControls data={data} onChange={handleUpdate} styles={styles} />;
    }

    if (block.type === "list") {
      const data = (block as any).listData ?? {};
      return <ListToolbarControls data={data} onChange={handleUpdate} styles={styles} />;
    }

    if (block.type === "divider") {
      const data = (block as any).dividerData ?? {};
      return <DividerToolbarControls data={data} onChange={handleUpdate} styles={styles} />;
    }

    if (block.type === "messageBox") {
      const data = (block as any).messageBoxData ?? {};
      return <MessageBoxToolbarControls data={data} onChange={handleUpdate} styles={styles} />;
    }

    if (block.type === "table") {
      const data = (block as any).tableData ?? {};
      return <TableToolbarControls data={data} onChange={handleUpdate} styles={styles} />;
    }

    if (block.type === "math") {
      const data = (block as any).mathData ?? {};
      return <MathToolbarControls data={data} onChange={handleUpdate} styles={styles} />;
    }

    if (block.type === "code") {
      const data = (block as any).codeData ?? {};
      return <CodeToolbarControls data={data} onChange={handleUpdate} styles={styles} />;
    }

    if (block.type === "chart") {
      const data = (block as any).chartData ?? {};
      return <ChartToolbarControls data={data} onChange={handleUpdate} styles={styles} />;
    }

    if (block.type === "image") {
      const data = (block as any).imageData ?? {};
      return <ImageToolbarControls data={data} onChange={handleUpdate} styles={styles} />;
    }

    if (block.type === "imageCompare") {
      const data = (block as any).imageCompareData ?? {};
      return <ImageCompareToolbarControls data={data} onChange={handleUpdate} styles={styles} />;
    }

    if (block.type === "imageCarousel") {
      const data = (block as any).imageCarouselData ?? {};
      return <ImageCarouselToolbarControls data={data} onChange={handleUpdate} styles={styles} />;
    }

    if (block.type === "imageGrid") {
      const data = (block as any).imageGridData ?? {};
      return <ImageGridToolbarControls data={data} onChange={handleUpdate} styles={styles} />;
    }

    if (block.type === "youtube") {
      const data = (block as any).youtubeData ?? {};
      return <YoutubeToolbarControls data={data} onChange={handleUpdate} styles={styles} />;
    }

    return null;
  };

  return (
    <div
      className={`absolute top-full left-0 mt-1 z-30 flex items-center gap-2 rounded-full border shadow-lg px-3 py-1 text-xs transition-opacity duration-150 ${styles.sections.siteBorders} ${styles.sections.contentBackground} ${
        visible
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      }`}
    >
      <Dropdown
        styles={styles}
        items={typeOptions.map((t) => ({ value: t, label: BLOCK_LABELS[t] ?? t }))}
        selectedValue={block.type as string}
        onSelect={(value) => handleTransform(value as BlockType)}
        placeholder="Type"
        className="min-w-[140px]"
      />
      {renderInlineControls()}
      <button
        type="button"
        className={`${styles.buttons.small} text-red-600`}
        onClick={() => onRemove(index)}
      >
        Delete
      </button>
    </div>
  );
}

export default BlockToolbar;
