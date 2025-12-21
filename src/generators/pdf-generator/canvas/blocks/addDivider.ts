import { Config } from "../../pdf-config";
import type { RenderContext } from "../../types/RenderContext";
import type { DividerData } from "@shadow-shard-tools/docs-core";

/* ------------------------------- spacing ---------------------------------- */
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

/* ------------------------------- helpers ---------------------------------- */
function textWidth(
  font: RenderContext["fonts"]["regular"],
  size: number,
  text: string,
) {
  return font.widthOfTextAtSize(text, size);
}

/** shrink font until label fits maxWidth (down to minSize) */
function fitLabelWidth(
  ctx: RenderContext,
  label: string,
  desiredSize: number,
  maxWidth: number,
  minSize = 8,
) {
  let size = desiredSize;
  let width = textWidth(ctx.fonts.regular, size, label);
  while (width > maxWidth && size > minSize) {
    size = Math.max(minSize, Math.floor(size - 1));
    width = textWidth(ctx.fonts.regular, size, label);
  }
  return { size, width };
}

/** draw one horizontal segment using PdfCanvas.drawRule without moving the cursor */
function drawSegment(
  ctx: RenderContext,
  x1: number,
  x2: number,
  yTop: number, // top-down y
  thickness: number,
  color: ReturnType<(typeof ctx.canvas)["drawRule"]> extends any ? any : never, // keep loose
) {
  const w = Math.max(0, x2 - x1);
  if (w <= 0) return;

  const before = ctx.canvas.cursorY;
  ctx.canvas.withRegion(
    { x: x1, y: yTop, width: w, height: thickness + 1 },
    () => {
      ctx.canvas.cursorY = yTop;
      ctx.canvas.drawRule({
        thickness,
        color,
        width: w,
        align: "left",
        spacingBefore: 0,
        spacingAfter: 0, // drawRule will advance by thickness; we restore next line
      });
    },
  );
  ctx.canvas.cursorY = before; // restore so multiple segments share the same baseline
}

/** draw a styled line (dashed/dotted/double/thick) via repeated segments */
function drawStyledLine(
  ctx: RenderContext,
  x1: number,
  x2: number,
  y: number,
  type: DividerData["type"] | undefined,
  baseThickness: number,
  color: any,
) {
  const drawSolid = (yy: number, lw = baseThickness) =>
    drawSegment(ctx, x1, x2, yy, lw, color);
  const drawPattern = (
    dash: number,
    gap: number,
    yy: number,
    lw = baseThickness,
  ) => {
    let x = x1;
    while (x < x2) {
      const end = Math.min(x + dash, x2);
      drawSegment(ctx, x, end, yy, lw, color);
      x = end + gap;
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
      drawPattern(6, 4, y, baseThickness);
      break;
    case "dotted":
      drawPattern(2, 3, y, baseThickness);
      break;
    default:
      drawSolid(y, baseThickness);
  }
}

/* --------------------------------- main ----------------------------------- */
export async function addDivider(ctx: RenderContext, data: DividerData) {
  const { top, bottom } = spacingFor(data);
  const color = Config.COLORS.divider;
  const baseThickness = 1;

  // Prefer PdfCanvas content bounds
  const xL = ctx.canvas.contentLeft;
  const xR = ctx.canvas.contentRight;
  const contentW = ctx.canvas.contentWidth;

  const hasLabel = !!data?.text?.trim();

  if (hasLabel) {
    const labelRaw = data!.text!.trim();
    const desiredSize = Config.FONT_SIZES.body;

    // Fit label to width (keep a little side slack for side lines)
    const { size: labelSize, width: labelW } = fitLabelWidth(
      ctx,
      labelRaw,
      desiredSize,
      Math.max(8, Math.floor(contentW * 0.92)),
      8,
    );

    // Use tight vertical budget (≈ cap-height) to avoid big spaces
    const labelH = Math.max(labelSize, Math.round(labelSize * 1.1));
    const needed = top + labelH + bottom;

    ctx.canvas.ensureSpace({ minHeight: needed });
    ctx.canvas.moveY(top);

    const baseY = ctx.canvas.cursorY;

    // Draw label in a narrow region so drawText won't wrap
    const textX = xL + (contentW - labelW) / 2;
    ctx.canvas.withRegion(
      { x: textX, y: baseY, width: labelW, height: labelH },
      () => {
        ctx.canvas.drawText(labelRaw, {
          font: ctx.fonts.regular,
          size: labelSize,
          color,
          align: "center",
          maxWidth: labelW,
          spacingBefore: 0,
          spacingAfter: 0,
          lineHeight: 1.0, // tight
        });
      },
    );

    // Side lines centered to label block
    const lineY = baseY + Math.round(labelH / 2);
    const pad = 8;
    const leftStop = Math.max(xL, textX - pad);
    const rightStart = Math.min(xR, textX + labelW + pad);

    if (leftStop - xL >= 2)
      drawStyledLine(
        ctx,
        xL,
        leftStop,
        lineY,
        data?.type,
        baseThickness,
        color,
      );
    if (xR - rightStart >= 2)
      drawStyledLine(
        ctx,
        rightStart,
        xR,
        lineY,
        data?.type,
        baseThickness,
        color,
      );

    // Advance minimally
    ctx.canvas.cursorY = baseY + labelH;
    if (bottom) ctx.canvas.moveY(bottom);
    return;
  }

  // Unlabeled: ultra-compact single rule
  const needed = top + baseThickness + bottom;
  ctx.canvas.ensureSpace({ minHeight: needed });
  if (top) ctx.canvas.moveY(top);
  const y = ctx.canvas.cursorY;

  drawStyledLine(ctx, xL, xR, y, data?.type, baseThickness, color);

  if (bottom) ctx.canvas.moveY(bottom);
}
