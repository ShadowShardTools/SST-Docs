// src/generators/pdf-generator/blocks/addMath.ts
import { Config } from "../../pdf-config";
import type { RenderContext } from "../../types/RenderContext";

import { mathjax } from "mathjax-full/js/mathjax.js";
import { TeX } from "mathjax-full/js/input/tex.js";
import { SVG } from "mathjax-full/js/output/svg.js";
import { liteAdaptor } from "mathjax-full/js/adaptors/liteAdaptor.js";
import { RegisterHTMLHandler } from "mathjax-full/js/handlers/html.js";
import { AllPackages } from "mathjax-full/js/input/tex/AllPackages.js";
import { Resvg } from "@resvg/resvg-js";
import type { MathData } from "@shadow-shard-tools/docs-core";

/* ------------------------------- MathJax setup ----------------------------- */
const adaptor = liteAdaptor();
RegisterHTMLHandler(adaptor);
const tex = new TeX({ packages: AllPackages });
const svg = new SVG({ fontCache: "none" }); // embed glyphs in SVG
const mjDoc = mathjax.document("", { InputJax: tex, OutputJax: svg });

type PngRender = {
  png: Uint8Array;
  width: number;
  height: number;
  scale: number;
};

/* Extract <svg>…</svg> from MathJax output */
function extractSvgMarkup(node: any): string {
  const inner = adaptor.innerHTML(node) || "";
  if (inner.includes("<svg")) {
    const start = inner.indexOf("<svg");
    const end = inner.indexOf("</svg>");
    if (start >= 0 && end > start)
      return inner.slice(start, end + "</svg>".length);
  }
  const queue = [node];
  while (queue.length) {
    const cur = queue.shift();
    const name = (adaptor as any).nodeName?.(cur);
    if (name && String(name).toLowerCase() === "svg")
      return adaptor.outerHTML(cur);
    const kids = adaptor.childNodes?.(cur) ?? [];
    for (const k of kids) queue.push(k);
  }
  return "";
}

async function renderMathToPng(
  latex: string,
  opts?: { display?: boolean; scale?: number },
): Promise<PngRender> {
  const node = mjDoc.convert(latex, {
    display: opts?.display ?? true,
    em: 16,
    ex: 8,
  });

  const svgMarkup = extractSvgMarkup(node);
  if (!svgMarkup || !svgMarkup.trim().startsWith("<svg")) {
    throw new Error(
      "MathJax did not produce a valid <svg> root for the given LaTeX.",
    );
  }

  const scale = Math.max(1, Math.floor(opts?.scale ?? 3));
  const r = new Resvg(svgMarkup, {
    fitTo: { mode: "zoom", value: scale },
    background: "rgba(255,255,255,0)", // transparent
  });

  const out = r.render();
  return { png: out.asPng(), width: out.width, height: out.height, scale };
}

/* ------------------------------- Public API -------------------------------- */
export async function addMath(
  ctx: RenderContext,
  mathData: MathData,
): Promise<void> {
  const expression = mathData.expression?.trim();
  if (!expression) return;

  const align = (mathData.alignment as "left" | "center" | "right") ?? "center";
  const spacing = Config.SPACING.textBottom;

  try {
    // Render LaTeX → SVG → PNG
    const rendered = await renderMathToPng(expression, {
      display: true,
      scale: 3,
    });

    // Natural size independent of oversampling scale
    const naturalW = rendered.width / rendered.scale;
    const naturalH = rendered.height / rendered.scale;

    const maxW = ctx.canvas.contentWidth;
    const drawW = Math.min(naturalW, maxW);
    const drawH = (naturalH * drawW) / naturalW;

    // Keep the whole formula together (prevents awkward splits)
    ctx.canvas.ensureBlock({
      minHeight: drawH + spacing * 2,
      keepTogether: true,
    });

    // Embed once, then draw via PdfCanvas (handles pagination & coords)
    const image = await ctx.doc.embedPng(rendered.png);

    // Top spacing, draw, bottom spacing
    ctx.canvas.moveY(spacing);
    ctx.canvas.drawImage(image as any, {
      width: drawW,
      height: drawH,
      align: align,
    });
    ctx.canvas.moveY(spacing);
  } catch (err) {
    // Fallback: show raw TeX as monospaced text so the doc still builds
    const mono = ctx.fonts.mono ?? ctx.fonts.regular;
    const text = expression.replace(/\s+/g, " ");
    ctx.canvas.drawText(text, {
      font: mono,
      size: Config.FONT_SIZES.body,
      color: Config.COLORS.text,
      align: align,
      maxWidth: ctx.canvas.contentWidth,
      spacingBefore: spacing,
      spacingAfter: spacing,
      lineHeight: 1.4,
    });
  }
}
