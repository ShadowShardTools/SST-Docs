// src/generators/pdf-generator/blocks/addYoutube.ts
import { Config } from "../../../configs/pdf-config";
import type { YoutubeData } from "../../../layouts/blocks/types";
import { extractYouTubeId } from "../../../layouts/blocks/utilities";
import type { RenderContext } from "../types/RenderContext";

export async function addYoutube(ctx: RenderContext, data: YoutubeData) {
  const videoId = extractYouTubeId(data.youtubeVideoId);
  if (!videoId) return;

  const contentX = Config.MARGIN;
  const contentW = Config.PAGE.width - 2 * Config.MARGIN;
  const url = `https://youtu.be/${videoId}`;
  const align = data.alignment ?? "left";

  const captionText = data.caption?.trim() ? `${data.caption.trim()}: ` : "";
  const linkFont = ctx.fonts.bold; // stylistic choice for link
  const captionFont = ctx.fonts.italic; // stylistic choice for caption
  const size = Config.FONT_SIZES.body;

  // Measure widths
  const captionW = captionText
    ? ctx.canvas.widthOf(captionText, captionFont, size)
    : 0;
  const linkW = ctx.canvas.widthOf(url, linkFont, size);
  const totalW = captionW + linkW;

  // Line height and total space needed
  const lineH = ctx.canvas.lineHeight(captionFont, size);
  const fitsOneLine = !captionText || totalW <= contentW;

  // If it doesn't fit on one line, we'll draw caption then link on the next line.
  const captionLines =
    !fitsOneLine && captionText
      ? ctx.canvas.wrapText(captionText, captionFont, size, contentW)
      : [];
  const captionBlockH =
    captionLines.length > 0
      ? captionLines.length * lineH
      : captionText && fitsOneLine
        ? lineH
        : 0;

  const needed =
    (fitsOneLine ? lineH : captionBlockH + lineH) + Config.SPACING.textBottom;

  // Ensure space FIRST, then read fresh Y
  ctx.canvas.ensureSpace(needed);
  const y = ctx.canvas.getY();

  if (fitsOneLine) {
    // Single-line layout: [caption][link] on the same baseline
    let startX = contentX;
    if (align === "center") {
      startX = contentX + (contentW - totalW) / 2;
    } else if (align === "right") {
      startX = contentX + (contentW - totalW);
    }

    // Caption (optional)
    if (captionText) {
      ctx.canvas.drawTextBlock({
        text: captionText,
        x: startX,
        y,
        width: captionW, // tight width to avoid wrapping
        font: captionFont,
        size,
        color: Config.COLORS.text,
        lineGap: 0,
        align: "left",
        advanceCursor: false,
      });
    }

    // Link
    const linkX = startX + captionW;
    ctx.canvas.drawTextBlock({
      text: url,
      x: linkX,
      y,
      width: linkW, // tight width to avoid wrapping
      font: linkFont,
      size,
      color: Config.COLORS.link ?? Config.COLORS.text,
      lineGap: 0,
      align: "left",
      advanceCursor: false,
    });

    // Clickable area for the link
    ctx.canvas.drawLink({
      x: linkX,
      y,
      width: linkW,
      height: size + 2,
      url,
      underline: false,
    });

    // Advance cursor
    ctx.canvas.setY(y + lineH + Config.SPACING.textBottom);
    return;
  }

  // Two-line fallback: caption block (wrap) on first line(s), link on the next line
  // Draw caption (wrapped, aligned)
  if (captionText) {
    ctx.canvas.drawTextBlock({
      text: captionText,
      x: contentX,
      y,
      width: contentW,
      font: captionFont,
      size,
      color: Config.COLORS.text,
      lineGap: 2,
      align,
      advanceCursor: true, // move Y below caption automatically
    });
  }

  const linkY = ctx.canvas.getY();

  // Compute link X by alignment (we draw without wrapping)
  let linkX = contentX;
  if (align === "center") {
    linkX = contentX + (contentW - linkW) / 2;
  } else if (align === "right") {
    linkX = contentX + (contentW - linkW);
  }

  // Draw link text
  ctx.canvas.drawTextBlock({
    text: url,
    x: linkX,
    y: linkY,
    width: linkW, // tight width, no wrap
    font: linkFont,
    size,
    color: Config.COLORS.link ?? Config.COLORS.text,
    lineGap: 0,
    align: "left",
    advanceCursor: false,
  });

  // Clickable link area
  ctx.canvas.drawLink({
    x: linkX,
    y: linkY,
    width: linkW,
    height: size + 2,
    url,
    underline: false,
  });

  // Advance cursor past link
  ctx.canvas.setY(linkY + lineH + Config.SPACING.textBottom);
}
