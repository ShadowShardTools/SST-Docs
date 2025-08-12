import type { TextData } from "../../../layouts/blocks/types";
import { Config } from "../../../configs/pdf-config";
import type { RenderContext } from "../types/RenderContext";

export async function addText(ctx: RenderContext, data: TextData) {
  if (!data?.text) return;

  const processed = data.text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/\r\n/g, "\n");

  const lines = processed.split("\n");

  const font = ctx.fonts.regular;
  const size = Config.FONT_SIZES.body;
  const color = Config.COLORS.text;

  const x = Config.MARGIN;
  const width = Config.PAGE.width - 2 * Config.MARGIN;

  const spacingKey = data.spacing ?? "none";
  const spacingBottom =
    spacingKey === "small"
      ? Math.max(2, Math.floor(Config.SPACING.textBottom / 2))
      : spacingKey === "large"
        ? Math.floor(Config.SPACING.textBottom * 1.5)
        : spacingKey === "medium"
          ? Config.SPACING.textBottom
          : 0;

  const align = data.alignment ?? "left";
  const lh = ctx.canvas.lineHeight(font, size);
  const intraLineGap = 2;

  let totalH = 0;
  const measuredHeights: number[] = [];

  for (const line of lines) {
    if (line.trim() === "") {
      measuredHeights.push(lh);
      totalH += lh + intraLineGap;
      continue;
    }
    const wrapped = ctx.canvas.wrapText(line, font, size, width);
    const h = Math.max(lh, wrapped.length * lh);
    measuredHeights.push(h);
    totalH += h + intraLineGap;
  }
  if (lines.length > 0) totalH -= intraLineGap;

  ctx.canvas.ensureSpace(totalH + spacingBottom);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === "") {
      ctx.canvas.setY(
        ctx.canvas.getY() +
          measuredHeights[i] +
          (i < lines.length - 1 ? intraLineGap : 0),
      );
      continue;
    }

    ctx.canvas.drawTextBlock({
      text: line,
      x,
      y: ctx.canvas.getY(),
      width,
      font,
      size,
      color,
      align,
      lineGap: 0,
      advanceCursor: false,
    });

    ctx.canvas.setY(
      ctx.canvas.getY() +
        measuredHeights[i] +
        (i < lines.length - 1 ? intraLineGap : 0),
    );
  }

  ctx.canvas.setY(ctx.canvas.getY() + spacingBottom);
}
