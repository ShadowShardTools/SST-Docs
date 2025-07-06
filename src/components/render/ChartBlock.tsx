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
import { type StyleTheme } from "../../config/siteConfig";

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

interface Props {
  index: number;
  styles: StyleTheme;
  block: ContentBlock;
}

const ChartBlock: React.FC<Props> = ({ styles, block }) => {
  if (!block.chartData) return null;

  const { title, labels, datasets } = block.chartData;
  const chartType = block.chartType?.toLowerCase() || "bar";

  const ChartComponent = {
    bar: Bar,
    line: Line,
    radar: Radar,
    doughnut: Doughnut,
    polararea: PolarArea,
    bubble: Bubble,
    pie: Pie,
    scatter: Scatter,
  }[chartType];

  if (!ChartComponent) {
    return (
      <div className="my-8">
        <p className="text-red-500">Unsupported chart type: {block.chartType}</p>
      </div>
    );
  }

  return (
    <div className="my-8 text-center">
      {title && <h3 className={styles.textStyles.chartTitle}>{title}</h3>}
      <ChartComponent
        data={{ labels, datasets }}
        options={{
          responsive: true,
          plugins: {
            legend: {
              labels: {
                color: styles.chartsStyles.legendLabelColor,
              },
              position: "bottom",
            },
            tooltip: {
              backgroundColor: styles.chartsStyles.tooltipBg,
              titleColor: styles.chartsStyles.tooltipTitleColor,
              bodyColor: styles.chartsStyles.tooltipBodyColor,
              borderColor: styles.chartsStyles.tooltipBorderColor,
              borderWidth: 1,
            },
          },
          scales: {
            x: {
              ticks: { color: styles.chartsStyles.axisTickColor },
              grid: { color: styles.chartsStyles.gridLineColor },
            },
            y: {
              ticks: { color: styles.chartsStyles.axisTickColor },
              grid: { color: styles.chartsStyles.gridLineColor },
            },
            r: {
              grid: { color: styles.chartsStyles.gridLineColor, lineWidth: 1 },
              angleLines: { color: styles.chartsStyles.gridLineColor, lineWidth: 1 },
              pointLabels: { color: styles.chartsStyles.axisTickColor },
              ticks: {
                color: styles.chartsStyles.axisTickColor,
                backdropColor: "transparent",   // no boxes behind numbers
              },
            },
          },
        }}
      />
    </div>
  );
};

export default ChartBlock;
