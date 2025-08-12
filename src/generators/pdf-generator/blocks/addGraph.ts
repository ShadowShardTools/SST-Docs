// src/generators/pdf-generator/blocks/addGraph.ts
import type { RenderContext } from "../types/RenderContext";
import type { GraphData } from "../../../layouts/blocks/types";
import { Config } from "../../../configs/pdf-config";

// Extracts the Desmos calculator URL from expressions
function buildDesmosUrl(expressions: string[]): string {
  if (!expressions?.length) return "https://www.desmos.com/calculator";
  // Encode LaTeX expressions for Desmos URL sharing
  const base = "https://www.desmos.com/calculator?lang=en";
  const params = expressions.map(expr => `expression=${encodeURIComponent(expr)}`);
  return `${base}&${params.join("&")}`;
}

const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n));

export function addGraph(ctx: RenderContext, data: GraphData) {
  if (!data?.expressions?.length) return;

  const { alignment = "center", scale: rawScale = 1 } = data;

  // Scale & layout
  const scale = clamp(rawScale ?? 1, 0.3, 1);
  const contentW = Config.PAGE.width - 2 * Config.MARGIN;
  const width = Math.round(contentW * scale);

  // Align
  const x =
    alignment === "left"
      ? Config.MARGIN
      : alignment === "right"
      ? Config.MARGIN + (contentW - width)
      : Config.MARGIN + Math.round((contentW - width) / 2);

  // Build Desmos link
  const url = buildDesmosUrl(data.expressions);

  // Reserve space
  ctx.canvas.ensureSpace(Config.SPACING.textBottom);
  const y = ctx.canvas.getY();

  // Draw link text
  ctx.canvas.drawTextBlock({
    text: url,
    x,
    width,
    font: ctx.fonts.bold,
    size: Config.FONT_SIZES.body,
    color: Config.COLORS.link ?? Config.COLORS.text,
    advanceCursor: false,
    align: "left", // manual x
  });

  // Clickable link
  ctx.canvas.drawLink({
    x,
    y,
    width,
    height: Config.FONT_SIZES.body + 2,
    url,
    underline: false,
  });

  // Move cursor
  ctx.canvas.setY(y + Config.SPACING.textBottom);
}
