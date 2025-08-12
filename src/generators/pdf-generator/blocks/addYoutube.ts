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

  const captionText = data.caption ? `${data.caption}: ` : "";
  const linkFont = ctx.fonts.bold;
  const linkSize = Config.FONT_SIZES.body;
  const captionFont = ctx.fonts.italic;

  // Measure parts
  const captionWidth = captionText
    ? ctx.canvas.widthOf(captionText, captionFont, linkSize)
    : 0;
  const linkWidth = ctx.canvas.widthOf(url, linkFont, linkSize);

  // Determine X positions based on alignment
  let startX = contentX;
  if (align === "center") {
    const totalWidth = captionWidth + linkWidth;
    startX = contentX + (contentW - totalWidth) / 2;
  } else if (align === "right") {
    const totalWidth = captionWidth + linkWidth;
    startX = contentX + (contentW - totalWidth);
  }

  const y = ctx.canvas.getY();
  const lineH = ctx.canvas.lineHeight(captionFont, linkSize, 2);
  ctx.canvas.ensureSpace(lineH + Config.SPACING.textBottom);

  // Draw caption
  if (captionText) {
    ctx.canvas.getPage().drawText(captionText, {
      x: startX,
      y: ctx.canvas.getPage().getHeight() - (y + linkSize),
      size: linkSize,
      font: captionFont,
      color: Config.COLORS.text,
    });
  }

  // Draw link
  const linkX = startX + captionWidth;
  ctx.canvas.getPage().drawText(url, {
    x: linkX,
    y: ctx.canvas.getPage().getHeight() - (y + linkSize),
    size: linkSize,
    font: linkFont,
    color: Config.COLORS.link ?? Config.COLORS.text,
  });

  // Clickable area for the link only
  ctx.canvas.drawLink({
    x: linkX,
    y,
    width: linkWidth,
    height: linkSize + 2,
    url,
    underline: false,
  });

  ctx.canvas.setY(y + lineH + Config.SPACING.textBottom);
}
