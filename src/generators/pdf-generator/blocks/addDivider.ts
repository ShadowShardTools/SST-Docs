import { rgb } from "pdf-lib";
import { Config } from "../../../configs/pdf-config";
import type { RenderContext } from "../types/RenderContext";
import type { DividerData } from "../../../layouts/blocks/types";

// spacing like your React block
function spacingFor(data: DividerData) {
  switch (data?.spacing) {
    case "small":
      return { top: 8, bottom: 8 };
    case "medium":
      return { top: 12, bottom: 12 };
    case "large":
      return { top: 16, bottom: 16 };
    default:
      return { top: 0, bottom: Config.SPACING.dividerBottom };
  }
}

// rough text width if PdfCanvas exposes no text-width API
function measureTextWidth(ctx: RenderContext, text: string, size: number) {
  // Prefer a canvas helper if you have one
  const anyCanvas = ctx.canvas as any;
  if (typeof anyCanvas.textWidth === "function") {
    return anyCanvas.textWidth(ctx.fonts.bold, size, text);
  }
  // Fallback: decent heuristic for sans fonts
  return text.length * size * 0.55;
}

function drawDashedLine(
  ctx: RenderContext,
  x1: number,
  x2: number,
  y: number,
  color: any,
  lineWidth: number,
  dash: number,
  gap: number,
) {
  let x = x1;
  while (x < x2) {
    const segEnd = Math.min(x + dash, x2);
    ctx.canvas.drawLine({
      x1: x,
      x2: segEnd,
      y,
      color,
      lineWidth,
      advanceCursor: false,
    });
    x = segEnd + gap;
  }
}

export function addDivider(ctx: RenderContext, data: DividerData) {
  const { top, bottom } = spacingFor(data);
  const pageW = Config.PAGE.width;
  const xL = Config.MARGIN;
  const xR = pageW - Config.MARGIN;
  const yBase = ctx.canvas.getY() + top;

  // ensure space for label (if any) + rule
  const labelSize = Config.FONT_SIZES.body;
  const lineHeight = labelSize; // Use font size as a proxy for line height
  const extraForLabel = data?.text ? lineHeight + 6 : 0; // text + small gap
  ctx.canvas.ensureSpace(top + extraForLabel + bottom);

  // advance to top spacing
  ctx.canvas.setY(yBase);

  const color = Config.COLORS.divider;
  const lineWidthBase = 1;

  // If there is a centered label, draw side lines + text
  if (data?.text && data?.text.trim().length) {
    // measure label width
    const text = data.text.trim();
    const textW = measureTextWidth(ctx, text, labelSize);

    // paddings left/right of the text where lines should stop
    const pad = 12;

    // Position text first to get the correct baseline
    const textY = ctx.canvas.getY();

    // draw text centered
    ctx.canvas.drawTextBlock({
      text,
      x: xL,
      y: textY,
      width: xR - xL,
      font: ctx.fonts.bold,
      size: labelSize,
      color: rgb(0.615, 0.643, 0.694), // matches your divider text style
      align: "center",
      advanceCursor: false,
    });

    // compute line y to be vertically centered to the text
    const lineY = textY + lineHeight / 2;

    // compute line stops around centered text
    const contentW = xR - xL;
    const centerX = xL + contentW / 2;
    const leftStop = centerX - textW / 2 - pad;
    const rightStart = centerX + textW / 2 + pad;

    // draw rule segments vertically centered to the text
    const type = data?.type ?? "line";
    if (type === "double") {
      // For double lines centered to text
      drawDashedLine(ctx, xL, leftStop, lineY, color, 1, 1000, 0);
      drawDashedLine(ctx, rightStart, xR, lineY, color, 1, 1000, 0);
      drawDashedLine(ctx, xL, leftStop, lineY + 3, color, 1, 1000, 0);
      drawDashedLine(ctx, rightStart, xR, lineY + 3, color, 1, 1000, 0);
    } else if (type === "thick") {
      drawDashedLine(ctx, xL, leftStop, lineY, color, 2, 1000, 0);
      drawDashedLine(ctx, rightStart, xR, lineY, color, 2, 1000, 0);
    } else if (type === "dashed") {
      drawDashedLine(ctx, xL, leftStop, lineY, color, lineWidthBase, 6, 4);
      drawDashedLine(ctx, rightStart, xR, lineY, color, lineWidthBase, 6, 4);
    } else if (type === "dotted") {
      // emulate dotted using tiny dashes with gaps
      drawDashedLine(ctx, xL, leftStop, lineY, color, lineWidthBase, 2, 3);
      drawDashedLine(ctx, rightStart, xR, lineY, color, lineWidthBase, 2, 3);
    } else if (type === "gradient") {
      ctx.canvas.drawLine({
        x1: xL,
        x2: leftStop,
        y: lineY,
        color,
        lineWidth: lineWidthBase,
        advanceCursor: false,
      });
      ctx.canvas.drawLine({
        x1: rightStart,
        x2: xR,
        y: lineY,
        color,
        lineWidth: lineWidthBase,
        advanceCursor: false,
      });
    } else {
      // simple line
      ctx.canvas.drawLine({
        x1: xL,
        x2: leftStop,
        y: lineY,
        color,
        lineWidth: lineWidthBase,
        advanceCursor: false,
      });
      ctx.canvas.drawLine({
        x1: rightStart,
        x2: xR,
        y: lineY,
        color,
        lineWidth: lineWidthBase,
        advanceCursor: false,
      });
    }

    // move cursor below the text
    ctx.canvas.setY(textY + labelSize + bottom);
    return;
  }

  // No label — single full-width rule
  const y = ctx.canvas.getY();
  const type = data?.type ?? "line";

  if (type === "double") {
    ctx.canvas.drawLine({
      x1: xL,
      x2: xR,
      y,
      color,
      lineWidth: 1,
      advanceCursor: false,
    });
    ctx.canvas.drawLine({
      x1: xL,
      x2: xR,
      y: y + 3,
      color,
      lineWidth: 1,
      advanceCursor: false,
    });
  } else if (type === "thick") {
    ctx.canvas.drawLine({
      x1: xL,
      x2: xR,
      y,
      color,
      lineWidth: 2,
      advanceCursor: false,
    });
  } else if (type === "dashed") {
    drawDashedLine(ctx, xL, xR, y, color, lineWidthBase, 6, 4);
  } else if (type === "dotted") {
    drawDashedLine(ctx, xL, xR, y, color, lineWidthBase, 2, 3);
  } else if (type === "gradient") {
    const anyCtx = ctx as any;
    if (anyCtx.drawHorizontalGradient) {
      anyCtx.drawHorizontalGradient(xL, y, xR - xL, color);
    } else {
      // fallback
      ctx.canvas.drawLine({
        x1: xL,
        x2: xR,
        y,
        color,
        lineWidth: lineWidthBase,
        advanceCursor: false,
      });
    }
  } else {
    ctx.canvas.drawLine({
      x1: xL,
      x2: xR,
      y,
      color,
      lineWidth: lineWidthBase,
      advanceCursor: false,
    });
  }

  ctx.canvas.setY(y + bottom);
}
