import React from "react";
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
} from "chart.js";
import {
  Bar,
  Line,
  Radar,
  Doughnut,
  PolarArea,
  Bubble,
  Pie,
  Scatter,
} from "react-chartjs-2";
import type { ContentBlock } from "../../types/entities/ContentBlock";
import { type StyleTheme } from "../../siteConfig";

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

/* ------------------------------------------------------------------ */
/*  Chart map + helper type                                            */
/* ------------------------------------------------------------------ */

const chartMap = {
  bar: Bar,
  line: Line,
  radar: Radar,
  doughnut: Doughnut,
  polarArea: PolarArea,
  bubble: Bubble,
  pie: Pie,
  scatter: Scatter,
} as const;

type ChartType = keyof typeof chartMap;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface Props {
  index: number;
  styles: StyleTheme;
  block: ContentBlock;
  scale?: number;
}

const ChartBlock: React.FC<Props> = ({ styles, block, scale = 1 }) => {
  if (!block.chartData || !block.chartType) return null;

  /* --- ensure chartType is a valid key --- */
  if (!(block.chartType in chartMap)) return null;
  const chartType = block.chartType as ChartType;

  const widthPercent = `${(isNaN(scale) || scale <= 0 ? 1 : scale) * 100}%`;

  /* ---------- shared plugin & color options ---------- */
  const baseOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: { color: styles.chartsStyles.legendLabelColor },
      },
      tooltip: {
        backgroundColor: styles.chartsStyles.tooltipBg,
        titleColor: styles.chartsStyles.tooltipTitleColor,
        bodyColor: styles.chartsStyles.tooltipBodyColor,
        borderColor: styles.chartsStyles.tooltipBorderColor,
        borderWidth: 1,
      },
    },
  } as const;

  /* ---------- axis helpers ---------- */
  const makeCartesianAxis = () => ({
    grid: { color: styles.chartsStyles.gridLineColor, borderDash: [] },
    ticks: { color: styles.chartsStyles.axisTickColor },
  });

  const makeRadialAxis = () => ({
    grid: { color: styles.chartsStyles.gridLineColor, borderDash: [] },
    angleLines: { color: styles.chartsStyles.gridLineColor, borderDash: [] },
    pointLabels: { color: styles.chartsStyles.axisTickColor },
  });

  /* ---------- per-chart options ---------- */
  const options =
    chartType === "radar" || chartType === "polarArea"
      ? { ...baseOptions, scales: { r: makeRadialAxis() } }
      : chartType === "bubble" || chartType === "scatter"
        ? {
            ...baseOptions,
            scales: { x: makeCartesianAxis(), y: makeCartesianAxis() },
          }
        : {
            ...baseOptions,
            scales: { x: makeCartesianAxis(), y: makeCartesianAxis() },
          };

  /* ---------- render ---------- */
  const ChartComponent = chartMap[chartType];
  return (
    <div className="mb-6 text-center mx-auto" style={{ width: widthPercent }}>
      <ChartComponent data={block.chartData} options={options} />
    </div>
  );
};

export default ChartBlock;
