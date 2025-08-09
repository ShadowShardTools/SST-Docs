import type { Content } from "../../layouts/render/types";
import { addCodeBlock } from "./blocks/addCodeBlock";
import { addDivider } from "./blocks/addDivider";
import { addList } from "./blocks/addList";
import { addMessageBox } from "./blocks/addMessageBox";
import { addTable } from "./blocks/addTable";
import { addText } from "./blocks/addText";
import { addTitle } from "./blocks/addTitle";
import { Config } from "./config";
import type { RenderContext } from "./types/RenderContext";

export function processContent(ctx: RenderContext, content: Content[]) {
    for (const item of content ?? []) {
        if (!item.type) {
            console.warn("⚠️  Skipping content item with no 'type'.");
            continue;
        }
        try {
            switch (item.type) {
                case "title":
                    if (item.titleData?.text)
                        addTitle(ctx, item.titleData.text, item.titleData.level ?? 1);
                    break;
                case "text":
                    if (item.textData?.text) addText(ctx, item.textData.text);
                    break;
                case "list":
                    if (item.listData?.items)
                        addList(ctx, item.listData.items, item.listData.type ?? "ul");
                    break;
                case "table":
                    if (item.tableData?.data) addTable(ctx, item.tableData.data);
                    break;
                case "message-box":
                    if (item.messageBoxData?.text) {
                        addMessageBox(
                            ctx,
                            item.messageBoxData.text,
                            item.messageBoxData.type ?? "info",
                            {
                                size: item.messageBoxData.size as any,
                                showIcon: item.messageBoxData.showIcon ?? true, // Default to showing icons
                            },
                        );
                    }
                    break;
                case "divider":
                    addDivider(ctx, item.dividerData?.text);
                    break;
                case "code":
                    if (item.codeData?.content) {
                        addCodeBlock(ctx, item.codeData.content, item.codeData.language);
                    } else if (item.codeData?.sections) {
                        for (const section of item.codeData.sections) {
                            if (section.filename) addText(ctx, `File: ${section.filename}`);
                            addCodeBlock(ctx, section.content, section.language);
                        }
                    }
                    break;
                case "math":
                    if (item.mathData?.expression) {
                        addText(ctx, `Mathematical Expression:`);
                        ctx.canvas.drawTextBlock({
                            text: item.mathData.expression,
                            x: Config.MARGIN + 20,
                            width: Config.LETTER.width - 2 * Config.MARGIN - 40,
                            font: ctx.fonts.mono,
                            size: Config.FONT_SIZES.messageBox,
                            color: Config.COLORS.text,
                        });
                        ctx.canvas.setY(ctx.canvas.getY() + 10);
                    }
                    break;
                case "chart":
                    if (item.chartData?.title) {
                        addText(ctx, `Chart: ${item.chartData.title}`);
                        if (item.chartData.labels && item.chartData.datasets) {
                            addText(ctx, `Labels: ${item.chartData.labels.join(", ")}`);
                            item.chartData.datasets.forEach((ds) =>
                                addText(ctx, `${ds.label}: ${ds.data.join(", ")}`),
                            );
                        }
                    }
                    break;
                case "image":
                    if (item.imageData?.image?.alt)
                        addText(ctx, `[Image: ${item.imageData.image.alt}]`);
                    else if (item.imageData?.type)
                        addText(ctx, `[${item.imageData.type} image content]`);
                    break;
                case "audio":
                    if (item.audioData?.caption)
                        addText(ctx, `[Audio: ${item.audioData.caption}]`);
                    break;
                default:
                    console.warn(`⚠️  Unsupported content type: ${item.type}`);
                    addText(ctx, `[Content type: ${item.type}]`);
            }
        } catch (e) {
            console.error(
                `❌ Error processing content item of type '${item.type}':`,
                e,
            );
        }
    }
}
