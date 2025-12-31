import type { Content } from "@shadow-shard-tools/docs-core";
import { DEFAULT_BLOCKS, type BlockType } from "../../blocks";

export const cloneTemplate = (type: BlockType): Content =>
  JSON.parse(JSON.stringify(DEFAULT_BLOCKS[type])) as Content;

export const extractText = (block: Content): string => {
  switch (block.type) {
    case "title":
      return (block as any).titleData?.text ?? "";
    case "text":
      return (block as any).textData?.text ?? "";
    case "divider":
      return (block as any).dividerData?.text ?? "";
    case "messageBox":
      return (block as any).messageBoxData?.text ?? "";
    case "list":
      return ((block as any).listData?.items ?? []).join("\n");
    default:
      return "";
  }
};

export const transformBlockAt = (
  blocks: Content[],
  index: number,
  to: BlockType,
): Content[] => {
  const src = blocks[index];
  const text = extractText(src);
  const next = [...blocks];
  const template = cloneTemplate(to) as any;

  if (to === "title") {
    next[index] = {
      ...template,
      titleData: { ...template.titleData, text },
    } as Content;
  } else if (to === "text") {
    next[index] = {
      ...template,
      textData: { ...template.textData, text },
    } as Content;
  } else if (to === "divider") {
    next[index] = {
      ...template,
      dividerData: { ...template.dividerData, text },
    } as Content;
  } else if (to === "messageBox") {
    next[index] = {
      ...template,
      messageBoxData: { ...template.messageBoxData, text },
    } as Content;
  } else if (to === "list") {
    const items =
      src.type === "list"
        ? ((src as any).listData?.items ?? [])
        : text.length > 0
          ? text.split("\n").filter(Boolean)
          : [];
    next[index] = {
      ...template,
      listData: { ...template.listData, items },
    } as Content;
  } else {
    next[index] = template;
  }
  return next;
};

export const insertBlockAfter = (
  blocks: Content[],
  index: number,
  type: BlockType,
): Content[] => {
  const template = cloneTemplate(type);
  const next = [...blocks];
  next.splice(index + 1, 0, template);
  return next;
};

export const updateBlockAt = (
  blocks: Content[],
  index: number,
  updater: (prev: Content) => Content,
): Content[] => {
  const next = [...blocks];
  next[index] = updater(next[index]);
  return next;
};
