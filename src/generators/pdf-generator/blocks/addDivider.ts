import { rgb } from "pdf-lib";
import { Config } from "../config";
import type { RenderContext } from "../types/RenderContext";

export function addDivider(ctx: RenderContext, label?: string) {
  ctx.canvas.ensureSpace(30);
  if (label) {
    ctx.canvas.drawTextBlock({
      text: label,
      font: ctx.fonts.bold,
      size: Config.FONT_SIZES.body,
      color: rgb(0.388, 0.431, 0.447),
      align: "center",
    });
    ctx.canvas.setY(ctx.canvas.getY() + 5);
  }
  ctx.canvas.drawLine({
    x1: Config.MARGIN,
    x2: Config.LETTER.width - Config.MARGIN,
    y: ctx.canvas.getY(),
    color: Config.COLORS.divider,
    lineWidth: 1,
    advanceCursor: true,
    gapBelow: Config.SPACING.dividerBottom,
  });
}
