// src/generators/pdf-generator/graphics/renderChartPng.ts
import { ChartJSNodeCanvas } from "chartjs-node-canvas";
import type { ChartConfiguration } from "chart.js";

export type RenderChartOpts = {
  width: number; // PDF points (content width)
  height: number; // PDF points
  backgroundColor?: string; // "transparent" by default
  config: ChartConfiguration;
  dpr?: number; // render at 2x for crispness
};

export async function renderChartPng(opts: RenderChartOpts): Promise<Buffer> {
  const dpr = Math.max(1, Math.floor(opts.dpr ?? 2));
  const pxW = Math.max(100, Math.round(opts.width * dpr));
  const pxH = Math.max(120, Math.round(opts.height * dpr));

  // IMPORTANT: create a NEW instance per size (or cache by size),
  // do NOT mutate internal width/height of a shared instance.
  const nodeCanvas = new ChartJSNodeCanvas({
    width: pxW,
    height: pxH,
    backgroundColour: opts.backgroundColor ?? "transparent",
  });

  // Chart.js renders at provided pixel size; the PNG will be pxW x pxH.
  // We'll place it in the PDF at width=opts.width, height=opts.height.
  return await nodeCanvas.renderToBuffer(opts.config, "image/png");
}
