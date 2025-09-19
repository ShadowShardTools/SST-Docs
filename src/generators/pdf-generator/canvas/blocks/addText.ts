import type { TextData } from "../../../../layouts/blocks/types";
import { Config } from "../../../../configs/pdf-config";
import type { RenderContext } from "../../types/RenderContext";

export async function addText(ctx: RenderContext, data: TextData) {
  if (!data?.text) return;

  // Strip simple **bold** / *italic* markers, normalize newlines
  const processed = data.text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/\r\n/g, "\n");

  const font = ctx.fonts.regular;
  const size = Config.FONT_SIZES.body;
  const color = Config.COLORS.text;
  const align = data.alignment ?? "left";

  const spacingKey = data.spacing ?? "none";
  const spacingBottom =
    spacingKey === "small"
      ? Math.max(2, Math.floor(Config.SPACING.textBottom / 2))
      : spacingKey === "large"
        ? Math.floor(Config.SPACING.textBottom * 1.5)
        : spacingKey === "medium"
          ? Config.SPACING.textBottom
          : 0;

  const intraLineGap = 2;
  const lineHeight = 1 + intraLineGap / size;

  ctx.canvas.drawText(processed, {
    font,
    size,
    color,
    align,
    maxWidth: ctx.canvas.contentWidth,
    lineHeight,
    spacingBefore: 0,
    spacingAfter: spacingBottom,
  });
}
