import type { ImageDrawingContext, ImageObject, DrawImageOptions, Rect } from "./types";

export function drawImage(
  context: ImageDrawingContext,
  image: ImageObject,
  opts: DrawImageOptions = {},
): Rect {
  const naturalW = image.width;
  const naturalH = image.height;

  const maxW = opts.maxWidth ?? context.contentWidth;
  const maxH = opts.maxHeight ?? (context.bottom - context.cursorY);
  const fit = opts.fit ?? "scale-down";

  let w = opts.width ?? Math.min(naturalW, maxW);
  let h = opts.height ?? (naturalH * w) / naturalW;

  // object-fit like behavior
  if (fit === "contain") {
    const scale = Math.min(maxW / w, maxH / h, 1);
    w *= scale; h *= scale;
  } else if (fit === "cover") {
    const scale = Math.max(maxW / w, maxH / h);
    w *= scale; h *= scale;
  } else if (fit === "scale-down") {
    const scale = Math.min(1, Math.min(maxW / w, maxH / h));
    w *= scale; h *= scale;
  }

  let x = opts.x ?? context.contentLeft;
  const yTop = opts.y ?? context.cursorY;

  const align = opts.align ?? "left";
  if (align === "center") x = context.contentLeft + (context.contentWidth - w) / 2;
  else if (align === "right") x = context.contentRight - w;

  context.ensureSpace({ minHeight: h });

  context.page.drawImage(image as any, {
    x,
    y: context.toPdfY(yTop + h),
    width: w,
    height: h,
  });

  // advance cursor only if we drew at current cursor position
  if (opts.y === undefined) context.moveY(h);

  return { x, y: yTop, width: w, height: h };
}

/**
 * Convenience method for contained image drawing
 */
export function drawImageContained(
  context: ImageDrawingContext,
  image: ImageObject,
  maxWidth = context.contentWidth,
  maxHeight = context.bottom - context.cursorY,
  align: "left" | "center" | "right" = "left"
): Rect {
  return drawImage(context, image, { maxWidth, maxHeight, fit: "contain", align });
}

/**
 * DPI helper for estimating image physical size
 */
export function estimateImagePhysicalSizePts(pxW: number, pxH: number, dpi = 72) {
  return { width: (pxW / dpi) * 72, height: (pxH / dpi) * 72 };
}