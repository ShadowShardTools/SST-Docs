import type { DocItem } from "@shadow-shard-tools/docs-core";
import { sanitizeRichText } from "../../common/utils/richText";

export const sanitizeContentBlocks = (content: DocItem["content"]) =>
  content.map((block) => {
    switch (block.type) {
      case "text":
        return {
          ...block,
          textData: {
            ...block.textData,
            text: sanitizeRichText(block.textData.text ?? ""),
          },
        };
      case "list":
        return {
          ...block,
          listData: {
            ...block.listData,
            items:
              block.listData.items?.map((item) => sanitizeRichText(item)) ?? [],
          },
        };
      case "messageBox":
        return {
          ...block,
          messageBoxData: {
            ...block.messageBoxData,
            text: sanitizeRichText(block.messageBoxData.text ?? ""),
          },
        };
      case "table":
        return {
          ...block,
          tableData: {
            ...block.tableData,
            data: block.tableData.data?.map((row) =>
              row.map((cell) => ({
                ...cell,
                content: sanitizeRichText(cell.content ?? ""),
              })),
            ),
          },
        };
      default:
        return block;
    }
  });

export const safeParseJson = (raw: string) => {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};
