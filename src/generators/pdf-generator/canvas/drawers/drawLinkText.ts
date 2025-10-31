import { rgb } from "pdf-lib";
import { drawLinkRect } from "./drawLinkRect";
import type { LinkTextContext, ParagraphOptions, Rect } from "./types";

export function drawLinkText(
  context: LinkTextContext,
  url: string,
  opts?: ParagraphOptions & { underline?: boolean },
): { rects: Rect[]; height: number } {
  const font = opts?.font ?? context.fonts.regular;
  const size = opts?.size ?? 12;
  const color = opts?.color ?? rgb(0, 0, 1);
  const align = opts?.align ?? "left";
  const lineHeight = opts?.lineHeight;
  const maxWidth = opts?.maxWidth ?? context.contentWidth;

  const { lines } = context.measureAndWrap(url, {
    font,
    size,
    lineHeight,
    maxWidth,
  });

  const rects: Rect[] = [];

  // render and annotate line by line
  const beforeY = context.cursorY;
  const { height } = context.drawText(url, { ...opts, color, align, maxWidth });

  // Recompute rects by measuring each line separately
  // (approximation: assume left/center/right alignment positions)
  let yCursor = beforeY;
  for (const line of lines) {
    const lineWidth = font.widthOfTextAtSize(line, size);
    let x = context.contentLeft;
    if (align === "center")
      x = context.contentLeft + (maxWidth - lineWidth) / 2;
    else if (align === "right")
      x = context.contentLeft + (maxWidth - lineWidth);

    const rect: Rect = {
      x,
      y: yCursor,
      width: lineWidth,
      height: (lineHeight ?? 1.4) * size,
    };
    drawLinkRect(context, { ...rect, url, underline: opts?.underline });
    rects.push(rect);
    yCursor += (lineHeight ?? 1.4) * size;
  }

  return { rects, height };
}
