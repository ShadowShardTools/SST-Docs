// src/generators/pdf-generator/blocks/addAudio.ts
import { rgb } from "pdf-lib";
import type { RenderContext } from "../types/RenderContext";
import { Config } from "../../../configs/pdf-config";
import type { AudioData } from "../../../layouts/blocks/types";

/**
 * Shows an info-styled message box (like addUnknown) with two lines:
 *  Audio player available only in browser version.
 *  Audio name to find: <filename.ext>
 */
export function addAudio(ctx: RenderContext, data: AudioData) {
  if (!data?.src?.trim()) return;

  const pad = 12;
  const fontSize = Config.FONT_SIZES.messageBox;
  const width = Config.PAGE.width - 2 * Config.MARGIN;

  const filename = extractAudioName(data.src);

  const line1 = "Audio player available only in browser version.";
  const line2 = `Audio name to find: ${filename}`;

  // Tailwind-like "info" theme (same numbers used in addMessageBox)
  const fill = rgb(0.878, 0.949, 1);        // bg-blue-100 (#DBEAFE)
  const stroke = rgb(0.769, 0.867, 0.933);  // border-blue-300
  const textColor = rgb(0.031, 0.188, 0.388); // text-blue-800

  const innerW = width - pad * 2;
  const lh = ctx.canvas.lineHeight(ctx.fonts.regular, fontSize);

  // Measure both lines using the same wrapping logic as the canvas
  const lines1 = ctx.canvas.wrapText(line1, ctx.fonts.regular, fontSize, innerW);
  const lines2 = ctx.canvas.wrapText(line2, ctx.fonts.regular, fontSize, innerW);

  const interGap = 2; // small gap between the two text blocks (matches lineGap)
  const textH = lines1.length * lh + interGap + lines2.length * lh;
  const boxH = textH + pad * 2;

  // Ensure space like addMessageBox/addUnknown
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

  // First line
  ctx.canvas.drawTextBlock({
    text: line1,
    x: Config.MARGIN + pad,
    y: top + pad,
    width: innerW,
    font: ctx.fonts.regular,
    size: fontSize,
    color: textColor,
    lineGap: 2,
    advanceCursor: false,
  });

  // Second line (placed right under the first)
  const firstBlockH = lines1.length * lh + interGap;
  ctx.canvas.drawTextBlock({
    text: line2,
    x: Config.MARGIN + pad,
    y: top + pad + firstBlockH,
    width: innerW,
    font: ctx.fonts.regular,
    size: fontSize,
    color: textColor,
    lineGap: 2,
    advanceCursor: false,
  });

  // Move cursor below the box
  ctx.canvas.setY(top + boxH + Config.SPACING.messageBoxBottom);
}

/** Extract a readable filename from URL or path. */
function extractAudioName(src: string): string {
  try {
    // Prefer URL parsing; supports http(s) and file paths with a base
    const url = new URL(src, "file:///");
    const raw = url.pathname || src;
    return cleanLastSegment(raw);
  } catch {
    // Fallback for plain paths
    return cleanLastSegment(src);
  }
}

function cleanLastSegment(pathLike: string): string {
  // Remove query/hash and normalize slashes
  const noHash = pathLike.split("#")[0];
  const noQuery = noHash.split("?")[0];
  const normalized = noQuery.replace(/\\/g, "/");
  const seg = normalized.split("/").filter(Boolean).pop() ?? normalized;
  try {
    return decodeURIComponent(seg);
  } catch {
    return seg;
  }
}
