import { rgb } from "pdf-lib";
import type { Rect, RuleDrawingContext, RuleOptions } from "./types";

export function drawRule(
  context: RuleDrawingContext,
  opts?: RuleOptions,
): Rect {
  const orientation = opts?.orientation ?? "horizontal";
  const thickness = opts?.thickness ?? 1;
  const color = opts?.color ?? rgb(0.8, 0.85, 0.9);
  const inline = opts?.inline ?? false;

  if (orientation === "horizontal") {
    const width = opts?.width ?? context.contentWidth;
    const align = opts?.align ?? "left";
    const x =
      align === "left"
        ? context.contentLeft
        : align === "right"
          ? context.contentRight - width
          : context.contentLeft + (context.contentWidth - width) / 2;

    const spacingBefore = opts?.spacingBefore ?? 8;
    const spacingAfter = opts?.spacingAfter ?? 8;

    if (!inline) {
      context.ensureSpace({
        minHeight: spacingBefore + thickness + spacingAfter,
      });
      context.moveY(spacingBefore);
    }
    const yTop = context.cursorY;
    const yPdf = context.toPdfY(context.cursorY);

    context.page.drawLine({
      start: { x, y: yPdf },
      end: { x: x + width, y: yPdf },
      thickness,
      color,
    });

    if (!inline) {
      context.moveY(thickness + spacingAfter);
    }
    return { x, y: yTop, width, height: thickness };
  } else {
    // vertical
    const length = opts?.length ?? 0;
    const x = opts?.x ?? context.contentLeft;
    const yTop = opts?.yTop ?? context.cursorY;
    const yPdfTop = context.toPdfY(yTop);
    const yPdfBottom = context.toPdfY(yTop + length);

    context.page.drawLine({
      start: { x, y: yPdfTop },
      end: { x, y: yPdfBottom },
      thickness,
      color,
    });

    // vertical rule doesn’t normally consume cursor anyway
    return { x, y: yTop, width: thickness, height: length };
  }
}
