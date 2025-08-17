import { Config } from "../../../configs/pdf-config";
import type { MathData } from "../../../layouts/blocks/types";
import type { RenderContext } from "../types/RenderContext";

import { mathjax } from "mathjax-full/js/mathjax.js";
import { TeX } from "mathjax-full/js/input/tex.js";
import { SVG } from "mathjax-full/js/output/svg.js";
import { liteAdaptor } from "mathjax-full/js/adaptors/liteAdaptor.js";
import { RegisterHTMLHandler } from "mathjax-full/js/handlers/html.js";
import { AllPackages } from "mathjax-full/js/input/tex/AllPackages.js";
import { Resvg } from "@resvg/resvg-js";

// -------------------------------
// MathJax singletons
// -------------------------------
const adaptor = liteAdaptor();
RegisterHTMLHandler(adaptor);
const tex = new TeX({ packages: AllPackages });
const svg = new SVG({ fontCache: "none" }); // embed glyphs into the SVG
const mjDoc = mathjax.document("", { InputJax: tex, OutputJax: svg });

type PngRender = {
  png: Uint8Array;
  width: number;
  height: number;
  scale: number;
};

// Extract just the <svg>...</svg> from MathJax's <mjx-container>
function extractSvgMarkup(node: any): string {
  // Fast path: MathJax puts the <svg> as the only child
  const inner = adaptor.innerHTML(node) || "";
  if (inner.includes("<svg")) {
    const start = inner.indexOf("<svg");
    const end = inner.indexOf("</svg>");
    if (start >= 0 && end > start)
      return inner.slice(start, end + "</svg>".length);
  }

  // Robust path: walk children to find the first <svg> element
  const queue = [node];
  while (queue.length) {
    const cur = queue.shift();
    const name = (adaptor as any).nodeName?.(cur);
    if (name && String(name).toLowerCase() === "svg") {
      return adaptor.outerHTML(cur);
    }
    const kids = adaptor.childNodes?.(cur) ?? [];
    for (const k of kids) queue.push(k);
  }

  return ""; // not found
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

async function embedPngMath(
  ctx: RenderContext,
  img: PngRender,
  alignment: "left" | "center" | "right",
) {
  const { canvas } = ctx as any;
  const contentW = canvas.pageWidth - 2 * canvas.margin;

  const naturalW = img.width / img.scale;
  const naturalH = img.height / img.scale;

  const drawW = Math.min(naturalW, contentW);
  const drawH = (naturalH * drawW) / naturalW;

  const topY = canvas.getY() + Config.SPACING.textBottom;
  const bottomLimit = canvas.pageHeight - canvas.margin;
  if (topY + drawH > bottomLimit) {
    if (typeof canvas.addPage === "function") {
      canvas.addPage();
    } else {
      const { doc } = getPdfHandles(ctx, canvas);
      const newPage = doc.addPage([canvas.pageWidth, canvas.pageHeight]);
      if (typeof canvas.setPage === "function") canvas.setPage(newPage);
      if (typeof canvas.setY === "function") canvas.setY(canvas.margin);
    }
  }

  let x = canvas.margin;
  if (alignment === "center") x = (canvas.pageWidth - drawW) / 2;
  else if (alignment === "right") x = canvas.pageWidth - canvas.margin - drawW;

  const { doc, page } = getPdfHandles(ctx, canvas);
  const pngRef = await doc.embedPng(img.png);

  const finalTopY = canvas.getY() + Config.SPACING.textBottom;
  const pdfY = canvas.pageHeight - finalTopY - drawH;

  page.drawImage(pngRef, { x, y: pdfY, width: drawW, height: drawH });

  canvas.setY(finalTopY + drawH + Config.SPACING.textBottom);
}

function getPdfHandles(ctx: RenderContext, canvas: any) {
  const doc =
    (ctx as any).doc ??
    (ctx as any).pdf ??
    (ctx as any).pdfDoc ??
    (ctx as any).document ??
    canvas?.getDoc?.() ??
    undefined;
  const page =
    (ctx as any).page ??
    (canvas as any)?.page ??
    canvas?.getPage?.() ??
    undefined;

  if (!doc || !page) {
    throw new Error(
      "RenderContext must expose a pdf-lib document and current page (e.g., ctx.doc/ctx.page or canvas.getDoc()/canvas.getPage()).",
    );
  }
  return { doc, page };
}

export async function addMath(
  ctx: RenderContext,
  mathData: MathData,
): Promise<void> {
  const expression = mathData.expression?.trim();
  if (!expression) return;

  const alignment: "left" | "center" | "right" =
    (mathData.alignment as any) ?? "center";

  try {
    const rendered = await renderMathToPng(expression, {
      display: true,
      scale: 3,
    });
    await embedPngMath(ctx, rendered, alignment);
  } catch (err) {
    // Fallback: render the raw TeX as monospace text so the document still builds
    const { canvas, fonts } = ctx as any;
    console.warn(`⚠️ Math render failed: ${(err as Error).message}`);
    const text = expression.replace(/\s+/g, " ");
    const size = 12;
    const contentW = canvas.pageWidth - 2 * canvas.margin;

    if (typeof canvas.drawTextBlock === "function") {
      canvas.drawTextBlock({
        text,
        x: canvas.margin,
        width: contentW,
        font: fonts?.mono ?? fonts?.regular,
        size,
        color: Config.COLORS.text,
        align: alignment,
        lineGap: 2,
        advanceCursor: true,
      });
    } else {
      // Minimal fallback
      const y = canvas.getY() + Config.SPACING.textBottom;
      const pdfY = canvas.pageHeight - y - size;
      const { page } = getPdfHandles(ctx, canvas);
      page.drawText(text, {
        x: canvas.margin,
        y: pdfY,
        size,
        font: (ctx as any).fonts?.mono ?? (ctx as any).fonts?.regular,
        color: Config.COLORS.text,
      });
      canvas.setY(y + size + Config.SPACING.textBottom);
    }
  }
}
