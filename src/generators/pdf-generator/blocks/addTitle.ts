import { Config } from "../config";
import type { RenderContext } from "../types/RenderContext";

export function addTitle(ctx: RenderContext, text: string, level = 1) {
  const size = (Config.FONT_SIZES as any)[`h${level}`] ?? Config.FONT_SIZES.h3;
  const topSpacing = Config.SPACING.titleTop;
  const bottomSpacing = Config.SPACING.titleBottom;

  ctx.canvas.ensureSpace(size + topSpacing + bottomSpacing);
  ctx.canvas.setY(ctx.canvas.getY() + topSpacing);
  ctx.canvas.drawTextBlock({
    text,
    font: ctx.fonts.bold,
    size,
    color: Config.COLORS.text,
  });
  ctx.canvas.setY(ctx.canvas.getY() + bottomSpacing);
}
