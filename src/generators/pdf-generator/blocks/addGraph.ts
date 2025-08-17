import type { RenderContext } from "../types/RenderContext";
import { Config } from "../../../configs/pdf-config";
import { Resvg } from "@resvg/resvg-js";
import { JSDOM } from "jsdom";
import type { GraphData } from "../../../layouts/blocks/types";

export async function addGraph(
  ctx: RenderContext,
  graph: GraphData,
): Promise<void> {
  const { canvas } = ctx;

  // spacing before
  canvas.setY(canvas.getY() + Config.SPACING.textBottom);

  // dimensions (16:9 like React)
  const maxW = canvas.pageWidth - 2 * canvas.margin;
  const scale = clampScale(graph.scale);
  const w = Math.max(200, Math.floor(maxW * scale));
  const h = Math.max(120, Math.round((w * 9) / 16));

  // Build SVG using function-plot in a headless DOM
  const svgStr = await renderSvgWithFunctionPlot({
    width: w,
    height: h,
    background: "#0f172a0D", // tweak to your theme if you want
    textColor: "#374151",
    curveColor: "#2563eb",
    expressions: graph.expressions ?? [],
  });

  // SVG -> PNG
  const PIXEL_RATIO = 3;
  const resvg = new Resvg(svgStr, {
    fitTo: { mode: "zoom", value: PIXEL_RATIO }, // <— key change
  });
  const pngBytes = resvg.render().asPng();
  const img = await ctx.doc.embedPng(pngBytes);

  // align like other blocks
  const x = (() => {
    const left = canvas.margin;
    const right = canvas.pageWidth - canvas.margin - w;
    const center = Math.round((left + right) / 2);
    switch (graph.alignment ?? "center") {
      case "left":
        return left;
      case "right":
        return right;
      default:
        return center;
    }
  })();

  canvas.drawImage({ image: img, x, y: canvas.getY(), width: w, height: h });

  // spacing after
  canvas.setY(canvas.getY() + h + Config.SPACING.textBottom);
}

function clampScale(s?: number) {
  return typeof s === "number" && isFinite(s)
    ? Math.min(1, Math.max(0.1, s))
    : 1;
}

/** Headless render via jsdom + function-plot */
async function renderSvgWithFunctionPlot(opts: {
  width: number;
  height: number;
  background: string;
  textColor: string;
  curveColor: string;
  expressions: string[];
}): Promise<string> {
  const dom = new JSDOM(`<html><body><div id="root"></div></body></html>`, {
    pretendToBeVisual: true,
  });
  const { window } = dom as unknown as { window: Window & typeof globalThis };
  const { document } = window;

  const container = document.getElementById("root") as HTMLDivElement;

  const { default: functionPlot } = await import("function-plot");

  container.innerHTML = "";
  functionPlot({
    target: container as any,
    width: opts.width,
    height: opts.height,
    grid: true,
    disableZoom: true,
    tip: { xLine: false, yLine: false, renderer: () => "" },
    data: (opts.expressions ?? []).map((expr, i) => ({
      fn: expr,
      color: opts.expressions.length > 1 ? palette(i) : opts.curveColor,
      graphType: "polyline",
    })),
  });

  const svg = container.querySelector("svg") as SVGSVGElement | null;
  if (!svg) {
    // Hard fallback that Resvg always accepts
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${opts.width}" height="${opts.height}" viewBox="0 0 ${opts.width} ${opts.height}"/>`;
  }

  // Size + background
  svg.setAttribute("width", String(opts.width));
  svg.setAttribute("height", String(opts.height));
  svg.setAttribute("viewBox", `0 0 ${opts.width} ${opts.height}`);

  // Ensure namespaces for Resvg
  if (!svg.getAttribute("xmlns")) {
    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  }
  if (!svg.getAttribute("xmlns:xlink")) {
    svg.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
  }

  // bump fonts/colors via <style>
  const styleEl = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "style",
  );
  styleEl.textContent = `
    text { font-size: 12px; fill: ${opts.textColor}; font-family: ui-sans-serif, system-ui, sans-serif; }
    .x .tick text, .y .tick text { font-size: 12px; }
  `;
  svg.insertBefore(styleEl, svg.firstChild);

  // rounded bg (optional; keeps look consistent)
  const bgRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  bgRect.setAttribute("x", "0");
  bgRect.setAttribute("y", "0");
  bgRect.setAttribute("width", String(opts.width));
  bgRect.setAttribute("height", String(opts.height));
  bgRect.setAttribute("rx", "12");
  bgRect.setAttribute("ry", "12");
  bgRect.setAttribute("fill", opts.background);
  // Insert just after <style>
  svg.insertBefore(bgRect, styleEl.nextSibling);

  // Serialize via XMLSerializer (more reliable than outerHTML for namespaces)
  const xml = new window.XMLSerializer().serializeToString(svg);

  // Final guard: ensure root tag and xmlns are present
  const svgStr = ensureNamespaces(xml);

  return svgStr;
}

function ensureNamespaces(svg: string): string {
  // If outerHTML lost xmlns, add it to the <svg ...> tag
  if (!/xmlns=/.test(svg)) {
    svg = svg.replace(
      /<svg\b/i,
      `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"`,
    );
  }
  // Also ensure there is exactly one root <svg> (trim leading BOM/whitespace)
  return svg.trimStart();
}

function palette(i: number) {
  const p = ["#2563eb", "#16a34a", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];
  return p[i % p.length];
}
