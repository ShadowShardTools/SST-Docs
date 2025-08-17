// src/generators/pdf-generator/processContent.ts
import type { Content } from "../../layouts/render/types";
import { addChart } from "./blocks/addChart";
import { addCode } from "./blocks/addBlock";
import { addList } from "./blocks/addList";
import { addMath } from "./blocks/addMath";
import { addMessageBox } from "./blocks/addMessageBox";
import { addTable } from "./blocks/addTable";
import { addText } from "./blocks/addText";
import { addTitle } from "./blocks/addTitle";
import { addUnknown } from "./blocks/addUnknown";
import { addYoutube } from "./blocks/addYoutube";
import type { RenderContext } from "./types/RenderContext";
import { addAudio } from "./blocks/addAudio";
import { addDivider } from "./blocks/addDivider";
import { addGraph } from "./blocks/addGraph";

export async function processContent(ctx: RenderContext, content: Content[]) {
  for (const [index, item] of (content ?? []).entries()) {
    if (!item.type) {
      console.warn(`⚠️  Skipping content item #${index} with no 'type'.`);
      continue;
    }
    try {
      switch (item.type) {
        case "title":
          if (item.titleData?.text) await addTitle(ctx, item.titleData);
          break;
        case "text":
          if (item.textData?.text) await addText(ctx, item.textData);
          break;
        case "list":
          if (item.listData?.items?.length) await addList(ctx, item.listData);
          break;
        case "table":
          if (item.tableData) await addTable(ctx, item.tableData);
          break;
        case "message-box":
          if (item.messageBoxData)
            await addMessageBox(ctx, item.messageBoxData);
          break;
        case "divider":
          if (item.dividerData) await addDivider(ctx, item.dividerData);
          break;
        case "image":
          //if (item.imageData) await addImage(ctx, item.imageData);
          break;
        case "youtube":
          if (item.youtubeData) await addYoutube(ctx, item.youtubeData);
          break;
        case "code":
          if (item.codeData) await addCode(ctx, item.codeData);
          break;
        case "math":
          if (item.mathData) await addMath(ctx, item.mathData);
          break;
        case "audio":
          if (item.audioData) await addAudio(ctx, item.audioData);
          break;
        case "chart":
          if (item.chartData) await addChart(ctx, item.chartData);
          break;
        case "graph":
          if (item.graphData) await addGraph(ctx, item.graphData);
          break;
        default:
          addUnknown(ctx, item.type);
          break;
      }
    } catch (e) {
      console.error(
        `❌ Error processing item #${index} of type '${item.type}':`,
        e,
      );
    }
  }
}
