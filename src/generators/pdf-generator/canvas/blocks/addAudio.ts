// src/generators/pdf-generator/blocks/addAudio.ts
import { rgb } from "pdf-lib";
import type { RenderContext } from "../../types/RenderContext";
import { Config } from "../../pdf-config";
import type { AudioData } from "@shadow-shard-tools/docs-core";

/**
 * Info-styled message box:
 *  - "Audio player available only in browser version."
 *  - "Audio name to find: <filename.ext>"
 */
export async function addAudio(ctx: RenderContext, data: AudioData) {
  if (!data?.src?.trim()) return;

  const pad = 12;
  const font = ctx.fonts.regular;
  const fontSize = Config.FONT_SIZES.messageBox;
  const width = ctx.canvas.contentWidth;

  const filename = extractAudioName(data.src);
  const line1 = "Audio player available only in browser version.";
  const line2 = `Audio name to find: ${filename}`;

  // Tailwind-like "info" theme (kept from previous impl)
  const fill = rgb(0.878, 0.949, 1); // bg-blue-100 (#DBEAFE)
  const stroke = rgb(0.769, 0.867, 0.933); // border-blue-300
  const textColor = rgb(0.031, 0.188, 0.388); // text-blue-800

  const innerW = Math.max(0, width - pad * 2);
  const interGap = 2; // small gap between two lines
  const lineHeight = 1 + interGap / fontSize; // emulate old lineGap=2px

  // Measure both text blocks
  const m1 = ctx.canvas.measureAndWrap(line1, {
    font,
    size: fontSize,
    maxWidth: innerW,
    lineHeight,
  });
  const m2 = ctx.canvas.measureAndWrap(line2, {
    font,
    size: fontSize,
    maxWidth: innerW,
    lineHeight,
  });

  const textH = m1.totalHeight + interGap + m2.totalHeight;
  const boxH = textH + pad * 2;
  const spacingBottom = Config.SPACING.messageBoxBottom;

  // Ensure space for box + spacing after
  ctx.canvas.ensureSpace({ minHeight: boxH + spacingBottom });

  const top = ctx.canvas.cursorY;

  // Background with rounded corners; returns inner content rect
  const inner = ctx.canvas.drawBox(width, boxH, {
    fill,
    stroke,
    strokeWidth: 1.5,
    padding: pad,
  });

  // Draw both lines inside the padded inner rect
  ctx.canvas.withRegion(inner, () => {
    ctx.canvas.cursorY = inner.y;

    ctx.canvas.drawText(line1, {
      font,
      size: fontSize,
      color: textColor,
      align: "left",
      maxWidth: inner.width,
      spacingBefore: 0,
      spacingAfter: interGap,
      lineHeight,
    });

    ctx.canvas.drawText(line2, {
      font,
      size: fontSize,
      color: textColor,
      align: "left",
      maxWidth: inner.width,
      spacingBefore: 0,
      spacingAfter: 0,
      lineHeight,
    });
  });

  // Place cursor below the box and add bottom spacing
  ctx.canvas.cursorY = top + boxH;
  ctx.canvas.moveY(spacingBottom);
}

/** Extract a readable filename from URL or path. */
function extractAudioName(src: string): string {
  try {
    const url = new URL(src, "file:///");
    const raw = url.pathname || src;
    return cleanLastSegment(raw);
  } catch {
    return cleanLastSegment(src);
  }
}

function cleanLastSegment(pathLike: string): string {
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
