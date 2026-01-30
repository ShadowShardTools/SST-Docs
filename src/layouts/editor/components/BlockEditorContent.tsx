import type { ReactNode } from "react";
import type { Content, StyleTheme } from "@shadow-shard-tools/docs-core";
import { ALIGNMENT_CLASSES } from "@shadow-shard-tools/docs-core";
import ContentBlockRenderer from "../../render/components/ContentBlockRenderer";
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

type BlockType = Content["type"];

interface BlockEditorContentProps {
  block: Content;
  index: number;
  blocks: Content[];
  styles: StyleTheme;
  currentPath: string;
  versionBasePath?: string | null;
  onChange: (updated: Content[]) => void;
}

type BlockRenderContext = {
  blocks: Content[];
  index: number;
  styles: StyleTheme;
  currentPath: string;
  versionBasePath?: string | null;
  onChange: (updated: Content[]) => void;
};

type BlockRenderer = (block: Content, ctx: BlockRenderContext) => ReactNode;

const applyUpdate = (
  ctx: BlockRenderContext,
  updater: (prev: Content) => Content,
) => {
  ctx.onChange(updateBlockAt(ctx.blocks, ctx.index, updater));
};

const blockRenderers: Partial<Record<BlockType, BlockRenderer>> = {
  text: (block, ctx) => {
    const textData = (block as any).textData ?? {};
    const alignKey = (textData.alignment ??
      "left") as keyof typeof ALIGNMENT_CLASSES;
    return (
      <EditableText
        value={textData.text ?? ""}
        alignmentClass={ALIGNMENT_CLASSES[alignKey].text}
        textClass={ctx.styles.text.general}
        styles={ctx.styles}
        onChange={(next) =>
          applyUpdate(ctx, (prev) => ({
            ...prev,
            textData: {
              ...(prev as any).textData,
              text: next,
            },
          }))
        }
      />
    );
  },
  title: (block, ctx) => {
    const titleData = (block as any).titleData ?? {};
    const titleAlign = (titleData.alignment ??
      "left") as keyof typeof ALIGNMENT_CLASSES;
    return (
      <EditableTitle
        value={titleData.text ?? ""}
        level={titleData.level ?? 1}
        alignmentClass={ALIGNMENT_CLASSES[titleAlign].text}
        wrapperClass={ctx.styles.sections.contentBackground || ""}
        titleClasses={{
          1: ctx.styles.text.titleLevel1 || "text-4xl",
          2: ctx.styles.text.titleLevel2 || "text-3xl",
          3: ctx.styles.text.titleLevel3 || "text-2xl",
        }}
        showAnchor={!!titleData.enableAnchorLink}
        anchorClass={ctx.styles.text.titleAnchor}
        onChange={(next) =>
          applyUpdate(ctx, (prev) => ({
            ...prev,
            titleData: {
              ...(prev as any).titleData,
              text: next,
            },
          }))
        }
      />
    );
  },
  messageBox: (block, ctx) => (
    <EditableMessageBox
      data={(block as any).messageBoxData}
      textClass={ctx.styles.text.general}
      styles={ctx.styles}
      typeClasses={ctx.styles.messageBox as Record<string, string>}
      onChange={(next) =>
        applyUpdate(ctx, (prev) => ({
          ...prev,
          messageBoxData: {
            ...(prev as any).messageBoxData,
            text: next,
          },
        }))
      }
    />
  ),
  table: (block, ctx) => (
    <EditableTable
      data={(block as any).tableData}
      styles={ctx.styles}
      onChange={(nextTableData) =>
        applyUpdate(ctx, (prev) => ({
          ...prev,
          tableData: {
            ...(prev as any).tableData,
            ...nextTableData,
          },
        }))
      }
    />
  ),
  divider: (block, ctx) => {
    const dividerData = (block as any).dividerData ?? {};
    return (
      <EditableDivider
        data={dividerData}
        styles={ctx.styles}
        onChange={(next) =>
          applyUpdate(ctx, (prev) => ({
            ...prev,
            dividerData: {
              ...(prev as any).dividerData,
              text: next,
            },
          }))
        }
      />
    );
  },
  list: (block, ctx) => {
    const listData = (block as any).listData ?? {};
    const listAlign = (listData.alignment ??
      "left") as keyof typeof ALIGNMENT_CLASSES;
    const listClass = [
      ctx.styles.text.list,
      listData.type === "ol" ? "list-decimal" : "list-disc",
      listData.inside ? "ml-4" : "",
      ALIGNMENT_CLASSES[listAlign].text,
    ]
      .filter(Boolean)
      .join(" ");
    return (
      <EditableList
        data={listData}
        listClass={listClass}
        styles={ctx.styles}
        onChange={(items) =>
          applyUpdate(ctx, (prev) => ({
            ...prev,
            listData: { ...(prev as any).listData, items },
          }))
        }
      />
    );
  },
  chart: (block, ctx) => (
    <EditableChart
      data={(block as any).chartData}
      styles={ctx.styles}
      onChange={(nextChart) =>
        applyUpdate(ctx, (prev) => ({
          ...prev,
          chartData: {
            ...(prev as any).chartData,
            ...nextChart,
          },
        }))
      }
    />
  ),
  audio: (block, ctx) => (
    <EditableAudio
      data={(block as any).audioData}
      styles={ctx.styles}
      versionBasePath={ctx.versionBasePath}
      onChange={(nextAudio) =>
        applyUpdate(ctx, (prev) => ({
          ...prev,
          audioData: {
            ...(prev as any).audioData,
            ...nextAudio,
          },
        }))
      }
    />
  ),
  image: (block, ctx) => (
    <EditableImage
      data={(block as any).imageData}
      styles={ctx.styles}
      versionBasePath={ctx.versionBasePath}
      onChange={(nextImage) =>
        applyUpdate(ctx, (prev) => ({
          ...prev,
          imageData: {
            ...(prev as any).imageData,
            ...nextImage,
          },
        }))
      }
    />
  ),
  imageCompare: (block, ctx) => (
    <EditableImageCompare
      data={(block as any).imageCompareData}
      styles={ctx.styles}
      versionBasePath={ctx.versionBasePath}
      onChange={(nextCompare) =>
        applyUpdate(ctx, (prev) => ({
          ...prev,
          imageCompareData: {
            ...(prev as any).imageCompareData,
            ...nextCompare,
          },
        }))
      }
    />
  ),
  imageCarousel: (block, ctx) => (
    <EditableImageCarousel
      data={(block as any).imageCarouselData}
      styles={ctx.styles}
      versionBasePath={ctx.versionBasePath}
      onChange={(nextCarousel) =>
        applyUpdate(ctx, (prev) => ({
          ...prev,
          imageCarouselData: {
            ...(prev as any).imageCarouselData,
            ...nextCarousel,
          },
        }))
      }
    />
  ),
  imageGrid: (block, ctx) => (
    <EditableImageGrid
      data={(block as any).imageGridData}
      styles={ctx.styles}
      versionBasePath={ctx.versionBasePath}
      onChange={(nextGrid) =>
        applyUpdate(ctx, (prev) => ({
          ...prev,
          imageGridData: {
            ...(prev as any).imageGridData,
            ...nextGrid,
          },
        }))
      }
    />
  ),
  youtube: (block, ctx) => (
    <EditableYoutube
      data={(block as any).youtubeData}
      styles={ctx.styles}
      onChange={(nextYoutube) =>
        applyUpdate(ctx, (prev) => ({
          ...prev,
          youtubeData: {
            ...(prev as any).youtubeData,
            ...nextYoutube,
          },
        }))
      }
    />
  ),
  code: (block, ctx) => (
    <EditableCode
      data={(block as any).codeData}
      styles={ctx.styles}
      onChange={(nextCode) =>
        applyUpdate(ctx, (prev) => ({
          ...prev,
          codeData: {
            ...(prev as any).codeData,
            ...nextCode,
          },
        }))
      }
    />
  ),
  math: (block, ctx) => (
    <EditableMath
      data={(block as any).mathData}
      styles={ctx.styles}
      onChange={(nextMath) =>
        applyUpdate(ctx, (prev) => ({
          ...prev,
          mathData: {
            ...(prev as any).mathData,
            ...nextMath,
          },
        }))
      }
    />
  ),
};

export function BlockEditorContent({
  block,
  index,
  blocks,
  styles,
  currentPath,
  versionBasePath,
  onChange,
}: BlockEditorContentProps) {
  const renderer = blockRenderers[block.type as BlockType];
  if (renderer) {
    return renderer(block, {
      blocks,
      index,
      styles,
      currentPath,
      versionBasePath,
      onChange,
    });
  }

  return (
    <ContentBlockRenderer
      styles={styles}
      content={[block]}
      currentPath={currentPath}
    />
  );
}
