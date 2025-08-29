import { rgb } from "pdf-lib";
import type { BoxDrawingContext, BoxOptions, Rect } from "./types";

function toColor(c: ReturnType<typeof rgb> | undefined) {
  return c ?? undefined;
}

/**
 * Draw a box with optional stroke and fill, returning the inner content area
 */
export function drawBox(
  context: BoxDrawingContext,
  width: number,
  height: number,
  opts?: BoxOptions
): Rect {
  const pad = opts?.padding ?? 12;
  const stroke = toColor(opts?.stroke ?? rgb(0.88, 0.9, 0.93));
  const strokeWidth = opts?.strokeWidth ?? 1;
  const fill = toColor(opts?.fill ?? undefined);

  context.ensureSpace({ minHeight: height });

  const x = context.contentLeft;
  const yTop = context.cursorY;

  context.page.drawRectangle({
    x,
    y: context.toPdfY(yTop + height),
    width,
    height,
    borderColor: stroke ?? undefined,
    borderWidth: stroke ? strokeWidth : 0,
    color: fill,
  });

  context.moveY(height);

  return {
    x: x + pad,
    y: yTop + pad,
    width: Math.max(0, width - pad * 2),
    height: Math.max(0, height - pad * 2),
  };
}