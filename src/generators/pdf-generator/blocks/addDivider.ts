import { Config } from "../../../configs/pdf-config";
import type { RenderContext } from "../types/RenderContext";
import type { DividerData } from "../../../layouts/blocks/types";

type PdfColor = Parameters<RenderContext["canvas"]["drawLine"]>[0]["color"];

// ---- spacing like your React block -----------------------------------------
function spacingFor(data: DividerData) {
  const S = Config.SPACING;
  switch (data?.spacing) {
    case "small":
      return { top: 0, bottom: S.small };
    case "medium":
      return { top: 0, bottom: S.medium };
    case "large":
      return { top: 0, bottom: S.large };
    default:
      return { top: 0, bottom: S.dividerBottom };
  }
}

// Prefer PdfCanvas helpers, fallback heuristics
function textWidth(
  ctx: RenderContext,
  text: string,
  fontSize: number,
  bold = false,
) {
  const anyCanvas = ctx.canvas as any;
  if (typeof anyCanvas.widthOf === "function") {
    return anyCanvas.widthOf(
      text,
      bold ? ctx.fonts.bold : ctx.fonts.regular,
      fontSize,
    );
  }
  if (typeof anyCanvas.textWidth === "function") {
    return anyCanvas.textWidth(
      bold ? ctx.fonts.bold : ctx.fonts.regular,
      fontSize,
      text,
    );
  }
  // reasonable sans fallback
  return text.length * fontSize * 0.55 * (bold ? 1.03 : 1);
}

function lineHt(ctx: RenderContext, fontSize: number) {
  const anyCanvas = ctx.canvas as any;
  if (typeof anyCanvas.lineHeight === "function") {
    return anyCanvas.lineHeight(ctx.fonts.regular, fontSize);
  }
  return Math.max(fontSize, Math.round(fontSize * 1.2));
}

// Draw a rule segment with style
function drawRuleSegment(
  ctx: RenderContext,
  x1: number,
  x2: number,
  y: number,
  color: PdfColor,
  type: DividerData["type"] | undefined,
  baseWidth: number,
) {
  const w = Math.max(0, x2 - x1);
  if (w <= 0) return;

  const drawSolid = (yy: number, lw = baseWidth) =>
    ctx.canvas.drawLine({
      x1,
      x2,
      y: yy,
      color,
      lineWidth: lw,
      advanceCursor: false,
    });

  const drawDashedRange = (
    dash: number,
    gap: number,
    yy: number,
    lw = baseWidth,
  ) => {
    let x = x1;
    while (x < x2) {
      const segEnd = Math.min(x + dash, x2);
      ctx.canvas.drawLine({
        x1: x,
        x2: segEnd,
        y: yy,
        color,
        lineWidth: lw,
        advanceCursor: false,
      });
      x = segEnd + gap;
    }
  };

  switch (type ?? "line") {
    case "double":
      drawSolid(y, 1);
      drawSolid(y + 3, 1);
      break;
    case "thick":
      drawSolid(y, 2);
      break;
    case "dashed":
      drawDashedRange(6, 4, y, baseWidth);
      break;
    case "dotted":
      drawDashedRange(2, 3, y, baseWidth);
      break;
    case "gradient": {
      const anyCtx = ctx as any;
      if (typeof anyCtx.drawHorizontalGradient === "function") {
        anyCtx.drawHorizontalGradient(x1, y, w, color);
      } else {
        drawSolid(y, baseWidth);
      }
      break;
    }
    default:
      drawSolid(y, baseWidth);
  }
}

export async function addDivider(ctx: RenderContext, data: DividerData) {
  const { top, bottom } = spacingFor(data);
  const pageW = Config.PAGE.width;
  const xL = Config.MARGIN;
  const xR = pageW - Config.MARGIN;
  const contentW = xR - xL;

  const color = Config.COLORS.divider;
  const lineWidthBase = 1;

  // Space planning
  const hasLabel = !!data?.text?.trim();
  const labelSize = Config.FONT_SIZES.body;
  const lh = lineHt(ctx, labelSize);
  const needed = top + (hasLabel ? lh + 6 : 1) + bottom;
  ctx.canvas.ensureSpace(needed);

  // Advance to top spacing
  ctx.canvas.setY(ctx.canvas.getY() + top);

  if (hasLabel) {
    const label = data!.text!.trim();
    const pad = 12;

    // Measure label and place as single line centered (avoid wrapping)
    const tW = Math.min(textWidth(ctx, label, labelSize, false), contentW); // use REGULAR
    const centerX = xL + contentW / 2;
    const textX = Math.max(xL, Math.min(centerX - tW / 2, xR - tW));
    const textY = ctx.canvas.getY();

    // Draw the label (REGULAR font)
    ctx.canvas.drawTextBlock({
      text: label,
      x: textX,
      y: textY,
      width: tW,
      font: ctx.fonts.regular, // <- not bold
      size: labelSize,
      color: Config.COLORS.divider,
      align: "center",
      lineGap: 0,
      advanceCursor: false,
    });

    // Lines on sides, vertically centered to label block
    const lineY = textY + lh / 2;
    const leftStop = Math.max(xL, textX - pad);
    const rightStart = Math.min(xR, textX + tW + pad);

    if (leftStop - xL >= 2) {
      drawRuleSegment(
        ctx,
        xL,
        leftStop,
        lineY,
        color,
        data?.type,
        lineWidthBase,
      );
    }
    if (xR - rightStart >= 2) {
      drawRuleSegment(
        ctx,
        rightStart,
        xR,
        lineY,
        color,
        data?.type,
        lineWidthBase,
      );
    }

    ctx.canvas.setY(textY + lh + bottom);
    return;
  }

  // No label: full-width rule
  const y = ctx.canvas.getY();
  drawRuleSegment(ctx, xL, xR, y, color, data?.type, lineWidthBase);
  ctx.canvas.setY(y + bottom);
}
