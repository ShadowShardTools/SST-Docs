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
import { ALIGNMENT_CLASSES } from "@shadow-shard-tools/docs-core";
import { getResponsiveWidth } from "@shadow-shard-tools/docs-core/utilities/dom/getResponsiveWidth";
import { validateScale } from "@shadow-shard-tools/docs-core/utilities/validation/validateScale";
import type { ChartData } from "@shadow-shard-tools/docs-core/types/ChartData";
import type { StyleTheme } from "@shadow-shard-tools/docs-core/types/StyleTheme";
import { useCurrentTheme } from "../../../application/hooks";

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

export const ChartBlock: React.FC<Props> = ({ styles, chartData }) => {
  const [theme] = useCurrentTheme();
  if (!chartData || !chartData.type || !(chartData.type in chartMap))
    return null;

  const type = chartData.type as ChartType;

  const scale = validateScale(chartData.scale);
  const widthPercent = getResponsiveWidth(scale, false);
  const alignment = chartData.alignment ?? "center";
  const chartColors = theme === "dark" ? styles.chartDark : styles.chart;

  const baseOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: { color: chartColors.legendLabelColor },
      },
      tooltip: {
        backgroundColor: chartColors.tooltipBg,
        titleColor: chartColors.tooltipTitleColor,
        bodyColor: chartColors.tooltipBodyColor,
        borderColor: chartColors.tooltipBorderColor,
        borderWidth: 1,
      },
    },
  } as const;

  const makeCartesianAxis = () => ({
    grid: { color: chartColors.gridLineColor, borderDash: [] },
    ticks: { color: chartColors.axisTickColor },
  });

  const makeRadialAxis = () => ({
    grid: { color: chartColors.gridLineColor, borderDash: [] },
    angleLines: { color: chartColors.gridLineColor, borderDash: [] },
    pointLabels: { color: chartColors.axisTickColor },
  });

  const options =
    chartData.type === "radar" || chartData.type === "polarArea"
      ? { ...baseOptions, scales: { r: makeRadialAxis() } }
      : {
          ...baseOptions,
          scales: { x: makeCartesianAxis(), y: makeCartesianAxis() },
        };

  const ChartComponent = chartMap[type];

  return (
    <div
      className={`mb-6 text-center ${ALIGNMENT_CLASSES[alignment].container}`}
      style={{ width: widthPercent }}
    >
      <ChartComponent data={chartData} options={options} />
    </div>
  );
};

export default ChartBlock;
