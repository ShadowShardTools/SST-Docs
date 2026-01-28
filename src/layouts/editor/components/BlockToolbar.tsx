import type { Content, StyleTheme } from "@shadow-shard-tools/docs-core";
import type { ReactNode } from "react";
import type { BlockType } from "../blocks";
import { BLOCK_LABELS } from "../blocks";
import { updateBlockAt, transformBlockAt } from "./utils/blockTransforms";
import Dropdown from "../../common/components/Dropdown";
import Button from "../../common/components/Button";
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
  Table as TableIcon,
  Text as TextIcon,
  Trash2,
  Youtube,
} from "lucide-react";

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

  const typeIcons: Record<BlockType, ReactNode> = {
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

  const renderInlineControls = () => {
    if (block.type === "title") {
      const data = (block as any).titleData ?? {};
      return (
        <TitleToolbarControls
          data={data}
          onChange={handleUpdate}
          styles={styles}
        />
      );
    }

    if (block.type === "text") {
      const data = (block as any).textData ?? {};
      return (
        <TextToolbarControls
          data={data}
          onChange={handleUpdate}
          styles={styles}
        />
      );
    }

    if (block.type === "list") {
      const data = (block as any).listData ?? {};
      return (
        <ListToolbarControls
          data={data}
          onChange={handleUpdate}
          styles={styles}
        />
      );
    }

    if (block.type === "divider") {
      const data = (block as any).dividerData ?? {};
      return (
        <DividerToolbarControls
          data={data}
          onChange={handleUpdate}
          styles={styles}
        />
      );
    }

    if (block.type === "messageBox") {
      const data = (block as any).messageBoxData ?? {};
      return (
        <MessageBoxToolbarControls
          data={data}
          onChange={handleUpdate}
          styles={styles}
        />
      );
    }

    if (block.type === "table") {
      const data = (block as any).tableData ?? {};
      return (
        <TableToolbarControls
          data={data}
          onChange={handleUpdate}
          styles={styles}
        />
      );
    }

    if (block.type === "math") {
      const data = (block as any).mathData ?? {};
      return (
        <MathToolbarControls
          data={data}
          onChange={handleUpdate}
          styles={styles}
        />
      );
    }

    if (block.type === "code") {
      const data = (block as any).codeData ?? {};
      return (
        <CodeToolbarControls
          data={data}
          onChange={handleUpdate}
          styles={styles}
        />
      );
    }

    if (block.type === "chart") {
      const data = (block as any).chartData ?? {};
      return (
        <ChartToolbarControls
          data={data}
          onChange={handleUpdate}
          styles={styles}
        />
      );
    }

    if (block.type === "image") {
      const data = (block as any).imageData ?? {};
      return (
        <ImageToolbarControls
          data={data}
          onChange={handleUpdate}
          styles={styles}
        />
      );
    }

    if (block.type === "imageCompare") {
      const data = (block as any).imageCompareData ?? {};
      return (
        <ImageCompareToolbarControls
          data={data}
          onChange={handleUpdate}
          styles={styles}
        />
      );
    }

    if (block.type === "imageCarousel") {
      const data = (block as any).imageCarouselData ?? {};
      return (
        <ImageCarouselToolbarControls
          data={data}
          onChange={handleUpdate}
          styles={styles}
        />
      );
    }

    if (block.type === "imageGrid") {
      const data = (block as any).imageGridData ?? {};
      return (
        <ImageGridToolbarControls
          data={data}
          onChange={handleUpdate}
          styles={styles}
        />
      );
    }

    if (block.type === "youtube") {
      const data = (block as any).youtubeData ?? {};
      return (
        <YoutubeToolbarControls
          data={data}
          onChange={handleUpdate}
          styles={styles}
        />
      );
    }

    return null;
  };

  return (
    <div
      className={`absolute top-full left-0 mt-1 z-30 flex items-center gap-2 rounded-md border px-3 py-1 text-xs transition-opacity duration-150 ${styles.modal.borders} ${styles.modal.content} ${
        visible
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      }`}
    >
      <Dropdown
        styles={styles}
        items={typeOptions.map((t) => ({
          value: t,
          label: BLOCK_LABELS[t] ?? t,
          icon: typeIcons[t],
        }))}
        selectedValue={block.type as string}
        onSelect={(value) => handleTransform(value as BlockType)}
        placeholder="Type"
        className="min-w-[140px]"
      />
      {renderInlineControls()}
      <Button
        type="button"
        className="inline-flex items-center justify-center w-8 h-8"
        styles={styles}
        onClick={() => onRemove(index)}
        aria-label="Delete block"
        title="Delete block"
      >
        <Trash2 className="w-5 h-5" />
      </Button>
    </div>
  );
}

export default BlockToolbar;
