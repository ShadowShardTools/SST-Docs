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
import type { ChartData } from "../types";
import type { StyleTheme } from "../../../types/StyleTheme";

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

interface Props {
  index: number;
  styles: StyleTheme;
  chartData?: ChartData;
}

const ChartBlock: React.FC<Props> = ({ styles, chartData }) => {
  if (!chartData || !chartData.type || !(chartData.type in chartMap))
    return null;

  const type = chartData.type as ChartType;

  const rawScale = chartData.scale ?? 1;
  const scale = rawScale > 0 ? rawScale : 1;
  const widthPercent = `${scale * 100}%`;

  // Alignment classes
  const alignment = chartData.alignment ?? "center";
  const alignmentClasses = {
    left: "mr-auto",
    center: "mx-auto",
    right: "ml-auto",
  };

  // Shared plugin options
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

  const makeCartesianAxis = () => ({
    grid: { color: styles.chart.gridLineColor, borderDash: [] },
    ticks: { color: styles.chart.axisTickColor },
  });

  const makeRadialAxis = () => ({
    grid: { color: styles.chart.gridLineColor, borderDash: [] },
    angleLines: { color: styles.chart.gridLineColor, borderDash: [] },
    pointLabels: { color: styles.chart.axisTickColor },
  });

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

  const ChartComponent = chartMap[type];

  return (
    <div
      className={`mb-6 text-center ${alignmentClasses[alignment]}`}
      style={{ width: widthPercent }}
    >
      <ChartComponent data={chartData} options={options} />
    </div>
  );
};

export default ChartBlock;
