import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve, relative } from "node:path";

import type { ChartData, Logger } from "@shadow-shard-tools/docs-core";
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
  Filler,
} from "chart.js";
import type { ChartConfiguration, ChartType, DefaultDataPoint } from "chart.js";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";

import type { StyleTheme } from "@shadow-shard-tools/docs-core/types/StyleTheme";

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
  Filler,
);

const DEFAULT_WIDTH = 960;
const DEFAULT_HEIGHT = 540;
const CONTENT_MAX_WIDTH = 896;
const CONTENT_MIN_WIDTH = 360;
const DEFAULT_ASPECT_RATIO = DEFAULT_HEIGHT / DEFAULT_WIDTH;
const BACKGROUND_COLOUR = "transparent";
const CHART_SUBDIR = "charts";
const CHART_STYLE_VERSION = "v2";

const TYPE_MAP: Record<string, ChartType> = {
  bar: "bar",
  line: "line",
  radar: "radar",
  doughnut: "doughnut",
  polarArea: "polarArea",
  bubble: "bubble",
  pie: "pie",
  scatter: "scatter",
};

const isRadialChart = (type: ChartType) =>
  type === "radar" || type === "polarArea";

export const resolveChartRenderWidth = (scale?: number): number => {
  const effectiveScale =
    scale === undefined || scale === null ? 1 : Number(scale);
  const clamped = Math.min(1, Math.max(0.35, effectiveScale));
  const width = Math.round(CONTENT_MAX_WIDTH * clamped);
  return Math.max(CONTENT_MIN_WIDTH, Math.min(CONTENT_MAX_WIDTH, width));
};

const resolveChartRenderHeight = (type: ChartType, width: number): number => {
  if (isRadialChart(type)) {
    return Math.max(width, Math.round(width * 0.8));
  }
  return Math.max(
    Math.round(CONTENT_MIN_WIDTH * DEFAULT_ASPECT_RATIO),
    Math.round(width * DEFAULT_ASPECT_RATIO),
  );
};

const hashChartInput = (
  data: ChartData,
  theme: StyleTheme["chart"],
  width: number,
  height: number,
) => {
  const hash = createHash("sha1");
  hash.update(
    JSON.stringify({
      data,
      theme,
      style: CHART_STYLE_VERSION,
      width,
      height,
    }),
  );
  return hash.digest("hex");
};

const normaliseChartType = (rawType?: string): ChartType => {
  if (!rawType) return "bar";
  const mapped = TYPE_MAP[rawType];
  return mapped ? mapped : "bar";
};

type InputDataset = ChartData["datasets"][number] &
  Partial<ChartConfiguration["data"]["datasets"][number]> & {
    pointRadius?: number;
    pointHoverRadius?: number;
  };

const buildChartConfiguration = (
  chartData: ChartData,
  theme: StyleTheme["chart"],
): ChartConfiguration => {
  const type = normaliseChartType(chartData.type);

  const baseFont = {
    family: "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    size: 22,
  };

  const sourceDatasets: InputDataset[] = chartData.datasets || [];
  const enhancedDatasets = sourceDatasets.map((dataset) => {
    const needsThickerLine =
      type === "line" || type === "scatter" || type === "radar";
    const defaultBorderWidth = needsThickerLine ? 3 : 2;
    const defaultPointRadius = needsThickerLine ? 4 : undefined;
    const defaultPointHoverRadius = needsThickerLine ? 5 : undefined;

    const lineCompatible = needsThickerLine || type === "bubble";

    const extras: Record<string, unknown> = {};

    if (lineCompatible) {
      if (dataset.borderWidth === undefined) {
        extras.borderWidth = defaultBorderWidth;
      }
      if (dataset.pointRadius === undefined) {
        extras.pointRadius = defaultPointRadius;
      }
      if (dataset.pointHoverRadius === undefined) {
        extras.pointHoverRadius = defaultPointHoverRadius;
      }
    } else if (dataset.borderWidth === undefined) {
      extras.borderWidth = defaultBorderWidth;
    }

    return {
      ...dataset,
      ...extras,
    };
  });
  const datasetsForChart =
    enhancedDatasets as unknown as ChartConfiguration["data"]["datasets"];

  const options: ChartConfiguration["options"] = {
    responsive: false,
    animation: false,
    maintainAspectRatio: false,
    font: baseFont,
    plugins: {
      legend: {
        labels: {
          color: theme.legendLabelColor || "#1f2937",
          font: {
            ...baseFont,
            size: 20,
          },
        },
      },
      tooltip: {
        backgroundColor: theme.tooltipBg || "#f9fafb",
        titleColor: theme.tooltipTitleColor || "#111827",
        bodyColor: theme.tooltipBodyColor || "#1f2937",
        borderColor: theme.tooltipBorderColor || "#d1d5db",
        borderWidth: 1,
        titleFont: {
          ...baseFont,
          size: 22,
        },
        bodyFont: {
          ...baseFont,
          size: 20,
        },
      },
    },
    layout: {
      padding: {
        left: 24,
        right: 24,
        top: 24,
        bottom: 24,
      },
    },
  };

  if (isRadialChart(type)) {
    options.scales = {
      r: {
        grid: {
          color: theme.gridLineColor || "rgba(0,0,0,0.05)",
        },
        angleLines: {
          color: theme.gridLineColor || "rgba(0,0,0,0.05)",
        },
        pointLabels: {
          color: theme.axisTickColor || "#4b5563",
          font: {
            ...baseFont,
            size: 20,
          },
        },
        ticks: {
          color: theme.axisTickColor || "#4b5563",
          font: {
            ...baseFont,
            size: 18,
          },
        },
      },
    };
  } else {
    options.scales = {
      x: {
        grid: {
          color: theme.gridLineColor || "rgba(0,0,0,0.05)",
        },
        ticks: {
          color: theme.axisTickColor || "#4b5563",
          font: {
            ...baseFont,
            size: 20,
          },
        },
      },
      y: {
        grid: {
          color: theme.gridLineColor || "rgba(0,0,0,0.05)",
        },
        ticks: {
          color: theme.axisTickColor || "#4b5563",
          font: {
            ...baseFont,
            size: 20,
          },
        },
      },
    };
  }

  const configuration: ChartConfiguration = {
    type,
    data: {
      labels: chartData.labels || [],
      datasets: datasetsForChart,
    },
    options,
  } as ChartConfiguration<ChartType, DefaultDataPoint<ChartType>, unknown>;

  return configuration;
};

interface ChartAssetInfo {
  hash: string;
  fileName: string;
  absolutePath: string;
  width: number;
  height: number;
}

export class ChartAssetManager {
  private readonly theme: StyleTheme;
  private readonly versionOutDir: string;
  private readonly logger: Logger;
  private readonly chartsDir: string;
  private readonly assets = new Map<string, ChartAssetInfo>();

  constructor(theme: StyleTheme, versionOutDir: string, logger: Logger) {
    this.theme = theme;
    this.versionOutDir = versionOutDir;
    this.logger = logger;
    this.chartsDir = resolve(this.versionOutDir, CHART_SUBDIR);
  }

  async prepareContent(
    content: Array<{ type: string; chartData?: ChartData }> | undefined,
  ): Promise<void> {
    if (!content || content.length === 0) return;
    for (const block of content) {
      if (block && block.type === "chart" && block.chartData) {
        const type = normaliseChartType(block.chartData.type);
        const width = resolveChartRenderWidth(block.chartData.scale);
        const height = resolveChartRenderHeight(type, width);
        await this.ensureAsset(block.chartData, width, height);
      }
    }
  }

  getAssetHref(
    chartData: ChartData,
    pageDir: string,
    targetWidth: number,
  ): { src: string; width: number; height: number } | null {
    const type = normaliseChartType(chartData.type);
    const width = Math.max(
      CONTENT_MIN_WIDTH,
      Math.min(CONTENT_MAX_WIDTH, Math.round(targetWidth)),
    );
    const height = resolveChartRenderHeight(type, width);
    const chartTheme = this.theme.chart || {};
    const hash = hashChartInput(chartData, chartTheme, width, height);
    const asset = this.assets.get(hash);
    if (!asset) return null;
    let rel = relative(pageDir, asset.absolutePath).replace(/\\/g, "/");
    if (!rel.startsWith("..") && !rel.startsWith(".")) {
      rel = `./${rel}`;
    }
    return { src: rel, width: asset.width, height: asset.height };
  }

  listAssets(): string[] {
    return Array.from(this.assets.values()).map((asset) =>
      relative(this.versionOutDir, asset.absolutePath).replace(/\\/g, "/"),
    );
  }

  private async ensureAsset(
    chartData: ChartData,
    width: number,
    height: number,
  ): Promise<ChartAssetInfo> {
    const chartTheme = this.theme.chart || {};
    const hash = hashChartInput(chartData, chartTheme, width, height);
    const existing = this.assets.get(hash);
    if (existing) return existing;

    const configuration = buildChartConfiguration(chartData, chartTheme);

    try {
      const canvas = new ChartJSNodeCanvas({
        width,
        height,
        backgroundColour: BACKGROUND_COLOUR,
        chartCallback: (chart) => {
          chart.defaults.font.family =
            "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
          chart.defaults.font.size = 22;
          chart.defaults.color = "#1f2937";
          chart.defaults.elements = chart.defaults.elements || {};
          chart.defaults.elements.line = {
            ...(chart.defaults.elements.line || {}),
            borderWidth: 3,
          };
          chart.defaults.elements.point = {
            ...(chart.defaults.elements.point || {}),
            radius: 4,
            hoverRadius: 5,
          };
          chart.defaults.elements.bar = {
            ...(chart.defaults.elements.bar || {}),
            borderWidth: 2,
          };
        },
      });

      const buffer = await canvas.renderToBuffer(configuration, "image/png");
      await mkdir(this.chartsDir, { recursive: true });
      const fileName = `chart-${hash}.png`;
      const absolutePath = resolve(this.chartsDir, fileName);
      await writeFile(absolutePath, buffer);

      const info: ChartAssetInfo = {
        hash,
        fileName,
        absolutePath,
        width,
        height,
      };
      this.assets.set(hash, info);
      return info;
    } catch (error) {
      this.logger.warn(`Failed to render chart asset: ${String(error)}`);
      throw error;
    }
  }
}
