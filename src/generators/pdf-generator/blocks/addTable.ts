import { Config } from "../config";
import type { RenderContext } from "../types/RenderContext";

export function addTable(
  ctx: RenderContext,
  data: Array<Array<{ content: string; isHeader?: boolean }>>,
) {
  if (!data?.length || !data[0]?.length) return;
  const cols = data[0].length;
  const totalW = Config.LETTER.width - 2 * Config.MARGIN;
  const colW = totalW / cols;
  const rowH = 25;
  for (const row of data) {
    ctx.canvas.ensureSpace(rowH);
    const rowTop = ctx.canvas.getY();
    row.forEach((cell, idx) => {
      const x = Config.MARGIN + idx * colW;
      ctx.canvas.drawRect({
        x,
        y: rowTop,
        width: colW,
        height: rowH,
        stroke: Config.COLORS.text,
        lineWidth: 0.5,
        advanceCursor: false,
      });
      ctx.canvas.drawTextBlock({
        text: cell.content,
        x: x + 5,
        y: rowTop + 6,
        width: colW - 10,
        font: cell.isHeader ? ctx.fonts.bold : ctx.fonts.regular,
        size: Config.FONT_SIZES.table,
        color: Config.COLORS.text,
        advanceCursor: false,
      });
    });
    ctx.canvas.setY(rowTop + rowH);
  }
  ctx.canvas.setY(ctx.canvas.getY() + Config.SPACING.tableBottom);
}
