// src/generators/pdf-generator/blocks/addYoutube.ts
import { Config } from "../../../../configs/pdf-config";
import type { YoutubeData } from "../../../../layouts/blocks/types";
import { extractYouTubeId } from "../../../../layouts/blocks/utilities";
import type { RenderContext } from "../../types/RenderContext";

export async function addYoutube(ctx: RenderContext, data: YoutubeData) {
  const videoId = extractYouTubeId(data.youtubeVideoId);
  if (!videoId) return;

  const url = `https://youtu.be/${videoId}`;
  const caption = data.caption?.trim();
  const text = caption ? `${caption}: ${url}` : url;

  const size = Config.FONT_SIZES.body;
  const color = Config.COLORS.link ?? Config.COLORS.text;
  const align = data.alignment ?? "left";

  const lineHeight = 1 + 2 / size;

  ctx.canvas.drawText(text, {
    font: ctx.fonts.regular,
    size,
    color,
    align,
    maxWidth: ctx.canvas.contentWidth,
    lineHeight,
    spacingBefore: 0,
    spacingAfter: Config.SPACING.textBottom,
  });
}
