import { Config } from "../config";
import type { RenderContext } from "../types/RenderContext";

export function addText(ctx: RenderContext, raw: string) {
  if (!raw) return;
  const processed = raw
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1");
  ctx.canvas.drawTextBlock({
    text: processed,
    font: ctx.fonts.regular,
    size: Config.FONT_SIZES.body,
    color: Config.COLORS.text,
  });
  ctx.canvas.setY(ctx.canvas.getY() + Config.SPACING.textBottom);
}
