import { rgb } from "pdf-lib";
import { Config } from "../config";
import type { RenderContext } from "../types/RenderContext";

export function addCodeBlock(
  ctx: RenderContext,
  content: string,
  language?: string,
) {
  if (!content) return;
  const width = Config.LETTER.width - 2 * Config.MARGIN;
  const mono = ctx.fonts.mono;
  const size = Config.FONT_SIZES.code;
  const paddingX = 10;
  const paddingY = 10;
  const labelH = language ? Config.FONT_SIZES.codeLabel + 8 : 0;

  const lines = ctx.canvas.wrapText(content, mono, size, width - paddingX * 2);
  const lh = ctx.canvas.lineHeight(mono, size);
  const codeH = Math.max(40, lines.length * lh + paddingY * 2 + labelH);

  ctx.canvas.ensureSpace(codeH + Config.SPACING.codeBottom);
  const top = ctx.canvas.getY();

  ctx.canvas.drawRect({
    x: Config.MARGIN,
    y: top,
    width,
    height: codeH,
    fill: Config.COLORS.codeBackground,
    stroke: Config.COLORS.codeBorder,
    lineWidth: 1,
    advanceCursor: false,
  });

  let textTop = top + paddingY;
  if (language) {
    ctx.canvas.drawTextBlock({
      text: language.toUpperCase(),
      x: Config.MARGIN + paddingX,
      y: textTop,
      width: width - paddingX * 2,
      font: ctx.fonts.bold,
      size: Config.FONT_SIZES.codeLabel,
      color: rgb(0.424, 0.459, 0.49),
      advanceCursor: false,
    });
    textTop += labelH;
  }

  ctx.canvas.drawTextBlock({
    text: content,
    x: Config.MARGIN + paddingX,
    y: textTop,
    width: width - paddingX * 2,
    font: mono,
    size,
    color: rgb(0.129, 0.145, 0.161),
    lineGap: 2,
    advanceCursor: false,
  });
  ctx.canvas.setY(top + codeH + Config.SPACING.codeBottom);
}
