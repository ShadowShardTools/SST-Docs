import type {
  ImageDrawingContext,
  ImageObject,
  DrawImageOptions,
  Rect,
} from "./types";

export function drawImage(
  context: ImageDrawingContext,
  image: ImageObject,
  opts: DrawImageOptions = {},
): Rect {
  const naturalW = image.width;
  const naturalH = image.height;

  const maxW = opts.maxWidth ?? context.contentWidth;
  const maxH = opts.maxHeight ?? context.bottom - context.cursorY;
  const fit = opts.fit ?? "scale-down";

  let w = opts.width ?? Math.min(naturalW, maxW);
  let h = opts.height ?? (naturalH * w) / naturalW;

  // Apply scaling if specified
  if (opts.scale) {
    w *= opts.scale;
    h *= opts.scale;
  }

  // Apply fit behavior
  if (fit === "contain") {
    const scale = Math.min(maxW / w, maxH / h, 1);
    w *= scale;
    h *= scale;
  } else if (fit === "cover") {
    const scale = Math.max(maxW / w, maxH / h);
    w *= scale;
    h *= scale;
  } else if (fit === "scale-down") {
    const scale = Math.min(1, Math.min(maxW / w, maxH / h));
    w *= scale;
    h *= scale;
  }

  // Position calculation
  let x = opts.x ?? context.contentLeft;

  // Apply alignment if no explicit x position given
  if (opts.x === undefined) {
    const align = opts.align ?? "left";
    if (align === "center") {
      x = context.contentLeft + (context.contentWidth - w) / 2;
    } else if (align === "right") {
      x = context.contentRight - w;
    }
  }

  // Add spacing before if specified and using current cursor position
  if (opts.spacingBefore && opts.y === undefined) {
    context.moveY(opts.spacingBefore);
  }

  // Ensure we have enough space for the image
  const finalY = opts.y ?? context.cursorY;
  context.ensureSpace({ minHeight: h });

  // Draw the image
  context.page.drawImage(image as any, {
    x,
    y: context.toPdfY(finalY + h), // Convert to PDF coordinates
    width: w,
    height: h,
  });

  // Handle caption if provided
  if (opts.y === undefined) {
    // Advance cursor only if we drew at current cursor position
    context.moveY(h);
  }

  // Add spacing after if specified and using current cursor position
  if (opts.spacingAfter && opts.y === undefined) {
    context.moveY(opts.spacingAfter);
  }

  return { x, y: finalY, width: w, height: h };
}

/**
 * Convenience method for contained image drawing
 */
export function drawImageContained(
  context: ImageDrawingContext,
  image: ImageObject,
  maxWidth = context.contentWidth,
  maxHeight = context.bottom - context.cursorY,
  align: "left" | "center" | "right" = "left",
): Rect {
  return drawImage(context, image, {
    maxWidth,
    maxHeight,
    align,
  });
}

/**
 * DPI helper for estimating image physical size
 */
export function estimateImagePhysicalSizePts(
  pxW: number,
  pxH: number,
  dpi = 72,
) {
  return { width: (pxW / dpi) * 72, height: (pxH / dpi) * 72 };
}
