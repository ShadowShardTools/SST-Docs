// src/generators/pdf-generator/blocks/addChart.ts
import { Config } from "../../pdf-config";
import type { RenderContext } from "../../types/RenderContext";
import type { ChartData } from "@shadow-shard-tools/docs-core";
import { renderChartPng } from "../../utilities";
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
import { clamp } from "../utilities";

// Register Chart.js components once.
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

type ChartOptions = ChartConfiguration;
type CacheEntry = { image: any; width: number; height: number };

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

function getCache(ctx: RenderContext): Map<string, CacheEntry> {
  const anyCtx = ctx as any;
  anyCtx._chartCache ||= new Map<string, CacheEntry>();
  return anyCtx._chartCache;
}

/** Render a chart to PNG, embed it, and cache the embedded image. */
async function renderAndCacheChart(
  ctx: RenderContext,
  key: string,
  config: ChartOptions,
  width: number,
  height: number,
): Promise<CacheEntry> {
  const cache = getCache(ctx);
  let entry = cache.get(key);
  if (!entry) {
    const png = await renderChartPng({
      width,
      height,
      backgroundColor: "transparent",
      config,
      dpr: 2, // crisp
    });
    const image = await ctx.doc.embedPng(png);
    entry = { image, width, height };
    cache.set(key, entry);
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

  if (!type || !datasets?.length) return;

  const contentW = ctx.canvas.contentWidth;
  const spacingAfter = Config.SPACING.medium;

  // Scale and sizing
  const scale = clamp(chartScale * 1.25, 0.5, 1);
  const drawW = Math.round(contentW * scale);
  const baseH = Math.max(180, Math.round(drawW * 0.56));
  const drawH = ["radar", "polarArea"].includes(type)
    ? Math.max(220, baseH)
    : baseH;

  // Chart.js configuration
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
            font: { size: 14, family: "sans-serif" },
          },
        },
        tooltip: {
          enabled: true,
          backgroundColor: "#f9fafb",
          titleColor: "#111827",
          bodyColor: "#1f2937",
          borderColor: "#d1d5db",
          borderWidth: 1,
          titleFont: { size: 14, family: "sans-serif" },
          bodyFont: { size: 14, family: "sans-serif" },
        },
      },
      scales: ["radar", "polarArea"].includes(type)
        ? {
            r: {
              grid: { color: "rgba(0,0,0,0.05)", lineWidth: 3 },
              angleLines: { color: "rgba(0,0,0,0.05)" },
              pointLabels: { color: "#4b5563", font: { size: 14 } },
              ticks: { color: "#4b5563", font: { size: 14 } },
            },
          }
        : {
            x: {
              grid: { color: "rgba(0,0,0,0.05)", lineWidth: 3 },
              ticks: { color: "#4b5563", font: { size: 14 } },
            },
            y: {
              grid: { color: "rgba(0,0,0,0.05)", lineWidth: 3 },
              ticks: { color: "#4b5563", font: { size: 14 } },
            },
          },
    },
  };

  // Cache key based on data and final draw size
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

  try {
    const entry = await renderAndCacheChart(ctx, key, config, drawW, drawH);

    // Use drawImage with proper options
    ctx.canvas.drawImage(entry.image, {
      width: entry.width,
      height: entry.height,
      align: alignment as "left" | "center" | "right",
      spacingAfter,
    });
  } catch (error) {
    // Fallback: simple text placeholder
    const placeholder = title
      ? `[Chart: ${title}]`
      : "[Chart could not be rendered]";

    ctx.canvas.drawText(placeholder, {
      font: ctx.fonts.regular,
      size: Config.FONT_SIZES.body,
      color: Config.COLORS.text,
      align: "left",
      maxWidth: ctx.canvas.contentWidth,
      spacingAfter,
    });

    console.error("Chart rendering error:", error);
  }
}
