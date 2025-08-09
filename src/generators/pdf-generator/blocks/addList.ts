import { Config } from "../config";
import type { RenderContext } from "../types/RenderContext";

export function addList(
  ctx: RenderContext,
  items: string[],
  type: "ul" | "ol" = "ul",
) {
  if (!items?.length) return;
  const width = Config.LETTER.width - 2 * Config.MARGIN - 20;
  const font = ctx.fonts.regular;
  const size = Config.FONT_SIZES.list;
  items.forEach((item, i) => {
    const bullet = type === "ol" ? `${i + 1}. ` : "- ";
    ctx.canvas.drawTextBlock({
      text: bullet + item,
      x: Config.MARGIN + 20,
      width,
      font,
      size,
      color: Config.COLORS.text,
    });
  });
  ctx.canvas.setY(ctx.canvas.getY() + Config.SPACING.listBottom);
}
