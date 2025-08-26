// src/generators/pdf-generator/blocks/addUnknown.ts
import { rgb } from "pdf-lib";
import type { RenderContext } from "../types/RenderContext";
import { Config } from "../../../configs/pdf-config";

export function addUnknown(ctx: RenderContext, type: string) {
  const pad = 12;
  const font = ctx.fonts.regular;
  const size = Config.FONT_SIZES.messageBox;
  const width = ctx.canvas.contentWidth;
  const spacingBottom = Config.SPACING.messageBoxBottom;

  const text = `Unknown content type: ${type}`;

  // Theme (same as your warning/message box)
  const fill = rgb(1, 0.973, 0.863);         // bg-yellow-100
  const stroke = rgb(0.992, 0.925, 0.682);   // border-yellow-300
  const textColor = rgb(0.322, 0.255, 0.051);// text-yellow-800

  // Wrap to fit inside padded box
  const lineHeight = 1 + 2 / size;
  const { lines, totalHeight } = ctx.canvas.measureAndWrap(text, {
    font,
    size,
    maxWidth: width - pad * 2,
    lineHeight,
  });

  const boxH = totalHeight + pad * 2;

  // Ensure whole box + spacing fits on the current page
  ctx.canvas.ensureSpace({ minHeight: boxH + spacingBottom });

  // Remember where the box starts
  const top = ctx.canvas.cursorY;

  // Background box
  ctx.canvas.drawBox(width, boxH, {
    fill,
    stroke,
    strokeWidth: 1.5,
    padding: 0, // we'll handle padding manually for uniform per-line
  });

  // Draw each wrapped line with uniform left padding
  ctx.canvas.cursorY = top + pad;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    ctx.canvas.drawText(line, {
      font,
      size,
      color: textColor,
      align: "left",
      maxWidth: width - pad * 2,
      spacingBefore: 0,
      spacingAfter: 0,  // lineHeight already advances the cursor
      lineHeight,
      indent: pad,      // applies to this (single) line → uniform padding
    });
  }

  // Move below the box and add bottom spacing
  ctx.canvas.cursorY = top + boxH;
  ctx.canvas.moveY(spacingBottom);
}
