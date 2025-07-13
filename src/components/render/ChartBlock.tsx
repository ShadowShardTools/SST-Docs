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
import type { StyleTheme } from "../../types/entities/StyleTheme";
import type { ChartData } from "../../types/data/ChartData";

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
  chartData?: ChartData;
  scale?: number;
}

const ChartBlock: React.FC<Props> = ({ styles, chartData, scale = 1 }) => {
  if (!chartData || !chartData.type) return null;

  /* --- ensure chartType is a valid key --- */
  if (!(chartData.type in chartMap)) return null;
  const type = chartData.type as ChartType;

  const widthPercent = `${(isNaN(scale) || scale <= 0 ? 1 : scale) * 100}%`;

  /* ---------- shared plugin & color options ---------- */
  const baseOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: { color: styles.chart.legendLabelColor },
      },
      tooltip: {
        backgroundColor: styles.chart.tooltipBg,
        titleColor: styles.chart.tooltipTitleColor,
        bodyColor: styles.chart.tooltipBodyColor,
        borderColor: styles.chart.tooltipBorderColor,
        borderWidth: 1,
      },
    },
  } as const;

  /* ---------- axis helpers ---------- */
  const makeCartesianAxis = () => ({
    grid: { color: styles.chart.gridLineColor, borderDash: [] },
    ticks: { color: styles.chart.axisTickColor },
  });

  const makeRadialAxis = () => ({
    grid: { color: styles.chart.gridLineColor, borderDash: [] },
    angleLines: { color: styles.chart.gridLineColor, borderDash: [] },
    pointLabels: { color: styles.chart.axisTickColor },
  });

  /* ---------- per-chart options ---------- */
  const options =
    chartData.type === "radar" || chartData.type === "polarArea"
      ? { ...baseOptions, scales: { r: makeRadialAxis() } }
      : chartData.type === "bubble" || chartData.type === "scatter"
        ? {
            ...baseOptions,
            scales: { x: makeCartesianAxis(), y: makeCartesianAxis() },
          }
        : {
            ...baseOptions,
            scales: { x: makeCartesianAxis(), y: makeCartesianAxis() },
          };

  /* ---------- render ---------- */
  const ChartComponent = chartMap[type];
  return (
    <div className="mb-6 text-center mx-auto" style={{ width: widthPercent }}>
      <ChartComponent data={chartData} options={options} />
    </div>
  );
};

export default ChartBlock;
