// src/generators/pdf-generator/blocks/addUnknownBlock.ts
import { rgb } from "pdf-lib";
import type { RenderContext } from "../types/RenderContext";
import { Config } from "../../../configs/pdf-config";

export function addUnknown(ctx: RenderContext, type: string) {
  const pad = 12;
  const fontSize = Config.FONT_SIZES.messageBox; // match message box sizing
  const width = Config.PAGE.width - 2 * Config.MARGIN;

  const text = `Unknown content type: ${type}`;

  // Tailwind-like "warning" theme (same numbers you used in addMessageBox)
  const fill = rgb(1, 0.973, 0.863); // bg-yellow-100
  const stroke = rgb(0.992, 0.925, 0.682); // border-yellow-300
  const textColor = rgb(0.322, 0.255, 0.051); // text-yellow-800

  // Measure text and total box height
  const lines = ctx.canvas.wrapText(
    text,
    ctx.fonts.regular,
    fontSize,
    width - pad * 2,
  );
  const lh = ctx.canvas.lineHeight(ctx.fonts.regular, fontSize);
  const textH = lines.length * lh;
  const boxH = textH + pad * 2;

  // Make sure there is room (like addMessageBox)
  ctx.canvas.ensureSpace(boxH + Config.SPACING.messageBoxBottom);
  const top = ctx.canvas.getY();

  // Background box
  ctx.canvas.drawRect({
    x: Config.MARGIN,
    y: top,
    width,
    height: boxH,
    fill,
    stroke,
    lineWidth: 1.5,
    advanceCursor: false,
  });

  // Text
  ctx.canvas.drawTextBlock({
    text,
    x: Config.MARGIN + pad,
    y: top + pad,
    width: width - pad * 2,
    font: ctx.fonts.regular,
    size: fontSize,
    color: textColor,
    lineGap: 2,
    advanceCursor: false,
  });

  // Move cursor below
  ctx.canvas.setY(top + boxH + Config.SPACING.messageBoxBottom);
}
