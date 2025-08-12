// src/generators/pdf-generator/blocks/addChart.ts
import { Config } from "../../../configs/pdf-config";
import type { RenderContext } from "../types/RenderContext";
import type { ChartData } from "../../../layouts/blocks/types";
import { renderChartPng } from "../graphics/renderChartPng";
import {
  Chart as ChartJS,
  BarElement,
  LineElement,
  ArcElement,
  PointElement,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  TimeScale,
  RadialLinearScale,
  Tooltip,
  Legend,
  type ChartConfiguration,
} from "chart.js";

// It's good practice to register all components at the top level.
ChartJS.register(
  BarElement,
  LineElement,
  ArcElement,
  PointElement,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  TimeScale,
  RadialLinearScale,
  Tooltip,
  Legend,
);

// Define a dedicated type for chart options to improve readability.
type ChartOptions = ChartConfiguration;

type CacheEntry = { image: any; width: number; height: number };

function getDoc(ctx: RenderContext) {
  const anyCanvas = ctx.canvas as any;
  if (typeof anyCanvas.getDoc === "function") return anyCanvas.getDoc();
  if ((ctx as any).doc) return (ctx as any).doc;
  throw new Error("PDFDocument handle not found");
}

function getCache(ctx: RenderContext): Map<string, CacheEntry> {
  const anyCtx = ctx as any;
  anyCtx._chartCache ||= new Map<string, CacheEntry>();
  return anyCtx._chartCache;
}

const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n));

const pickType = (type?: string) =>
  ([
    "bar",
    "line",
    "radar",
    "doughnut",
    "polarArea",
    "bubble",
    "pie",
    "scatter",
  ].includes(type || "")
    ? type
    : "bar") as any;

/**
 * Renders a chart as a PNG and caches the result.
 */
async function renderAndCacheChart(
  ctx: RenderContext,
  key: string,
  config: ChartOptions,
  width: number,
  height: number,
): Promise<CacheEntry> {
  const chartCache = getCache(ctx);
  let entry = chartCache.get(key);

  if (!entry) {
    const png = await renderChartPng({
      width,
      height,
      backgroundColor: "transparent",
      config,
      dpr: 2, // crisp
    });
    const doc = getDoc(ctx);
    const image = await doc.embedPng(png);
    entry = { image, width, height };
    chartCache.set(key, entry);
  }

  return entry;
}

export async function addChart(ctx: RenderContext, data: ChartData) {
  const {
    type,
    datasets,
    scale: chartScale = 1,
    alignment = "center",
    title,
  } = data;
  if (!type || !datasets?.length) {
    return;
  }

  // Content box
  const contentX = Config.MARGIN;
  const contentW = Config.PAGE.width - 2 * Config.MARGIN;

  // Scale and placement
  const scale = clamp(chartScale * 1.25, 0.5, 1);
  const drawW = Math.round(contentW * scale);
  const baseH = Math.max(180, Math.round(drawW * 0.56));
  const drawH = ["radar", "polarArea"].includes(type)
    ? Math.max(220, baseH)
    : baseH;

  const x =
    alignment === "left"
      ? contentX
      : alignment === "right"
        ? contentX + (contentW - drawW)
        : contentX + Math.round((contentW - drawW) / 2);

  // Chart.js config
  // inside config: ChartConfiguration
  const config: ChartConfiguration = {
    type: pickType(type),
    data: { labels: data.labels ?? [], datasets },
    options: {
      responsive: false,
      animation: false,
      plugins: {
        legend: {
          display: true,
          labels: {
            color: "#1f2937",
            font: { size: 14, family: "sans-serif" }, // bigger legend text
          },
        },
        tooltip: {
          enabled: true,
          backgroundColor: "#f9fafb",
          titleColor: "#111827",
          bodyColor: "#1f2937",
          borderColor: "#d1d5db",
          borderWidth: 1,
          titleFont: { size: 14, family: "sans-serif" }, // bigger tooltip title
          bodyFont: { size: 14, family: "sans-serif" }, // bigger tooltip body
        },
      },
      scales: ["radar", "polarArea"].includes(type)
        ? {
            r: {
              grid: { color: "rgba(0,0,0,0.05)" },
              angleLines: { color: "rgba(0,0,0,0.05)" },
              pointLabels: { color: "#4b5563", font: { size: 14 } }, // bigger radar labels
              ticks: { color: "#4b5563", font: { size: 14 } }, // bigger radar ticks
            },
          }
        : {
            x: {
              grid: { color: "rgba(0,0,0,0.05)" },
              ticks: { color: "#4b5563", font: { size: 14 } }, // bigger x-axis labels
            },
            y: {
              grid: { color: "rgba(0,0,0,0.05)" },
              ticks: { color: "#4b5563", font: { size: 14 } }, // bigger y-axis labels
            },
          },
    },
  };

  // Cache by data + draw size (not by internal px size)
  const key = JSON.stringify({
    t: type,
    labels: data.labels,
    data: datasets.map((d) => ({
      l: d.label,
      a: d.data,
      bg: d.backgroundColor,
      bc: d.borderColor,
    })),
    w: drawW,
    h: drawH,
  });

  // reserve space even before rendering the PNG (prevents overlap if callers forget await)
  const gapBelow = Config.SPACING.medium;
  ctx.canvas.ensureSpace(drawH + gapBelow);
  const preTop = ctx.canvas.getY();

  try {
    const entry = await renderAndCacheChart(ctx, key, config, drawW, drawH);

    // draw at the reserved location
    const page = ctx.canvas.getPage();
    const topY = preTop;
    const pdfY = page.getHeight() - (topY + entry.height);

    page.drawImage(entry.image, {
      x,
      y: pdfY,
      width: entry.width,
      height: entry.height,
    });

    // advance cursor to after chart
    ctx.canvas.setY(topY + entry.height + gapBelow);
  } catch (err) {
    console.warn("addChart(): render/embed failed; falling back to text", err);

    const fallbackY = preTop;
    ctx.canvas.setY(fallbackY);
    ctx.canvas.drawTextBlock({
      text: title ? `[Chart: ${title}]` : "[Chart could not be rendered]",
      x: contentX,
      y: ctx.canvas.getY(),
      width: contentW,
      font: ctx.fonts.regular,
      size: Config.FONT_SIZES.body,
      color: Config.COLORS.text,
      advanceCursor: false,
    });
    // move past reserved area
    ctx.canvas.setY(fallbackY + drawH + gapBelow);
  }
}
