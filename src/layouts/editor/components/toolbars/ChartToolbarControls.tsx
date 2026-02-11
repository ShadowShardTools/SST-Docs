import type { Content, StyleTheme } from "@shadow-shard-tools/docs-core";
import type { ChartData } from "@shadow-shard-tools/docs-core/types/ChartData";
import {
  BarChart2,
  Bubbles,
  ChartScatter,
  CircleDot,
  Donut,
  LineChart,
  PieChart,
  Radar,
} from "lucide-react";
import Dropdown from "../../../common/components/Dropdown";
import AlignmentToggleButton from "./AlignmentToggleButton";
import NumericInput from "../../../common/components/NumericInput";

interface Props {
  data: any;
  onChange: (updater: (prev: Content) => Content) => void;
  styles: StyleTheme;
}

export function ChartToolbarControls({ data, onChange, styles }: Props) {
  const chartData: ChartData = data ?? {};
  const toggleAlignment = (next: ChartData["alignment"]) =>
    onChange((prev) => ({
      ...prev,
      chartData: { ...(prev as any).chartData, alignment: next },
    }));

  const updateType = (type: ChartData["type"]) =>
    onChange((prev) => ({
      ...prev,
      chartData: { ...(prev as any).chartData, type },
    }));

  const updateScale = (scale: number | undefined) =>
    onChange((prev) => ({
      ...prev,
      chartData: { ...(prev as any).chartData, scale },
    }));

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        <span>Type</span>
        <Dropdown
          styles={styles}
          items={[
            {
              value: "bar",
              label: "Bar",
              icon: <BarChart2 className="w-4 h-4" />,
            },
            {
              value: "line",
              label: "Line",
              icon: <LineChart className="w-4 h-4" />,
            },
            {
              value: "pie",
              label: "Pie",
              icon: <PieChart className="w-4 h-4" />,
            },
            {
              value: "doughnut",
              label: "Doughnut",
              icon: <Donut className="w-4 h-4" />,
            },
            {
              value: "radar",
              label: "Radar",
              icon: <Radar className="w-4 h-4" />,
            },
            {
              value: "polarArea",
              label: "Polar area",
              icon: <CircleDot className="w-4 h-4" />,
            },
            {
              value: "bubble",
              label: "Bubble",
              icon: <Bubbles className="w-4 h-4" />,
            },
            {
              value: "scatter",
              label: "Scatter",
              icon: <ChartScatter className="w-4 h-4" />,
            },
          ]}
          selectedValue={(chartData.type as string) ?? "bar"}
          onSelect={(val) => updateType(val as ChartData["type"])}
          className="min-w-[140px]"
        />
      </div>

      <AlignmentToggleButton
        styles={styles}
        value={(chartData.alignment ?? "center") as "left" | "center" | "right"}
        onChange={(val) => toggleAlignment(val as ChartData["alignment"])}
      />

      <label className="flex items-center gap-1">
        <span>Scale</span>
        <NumericInput
          step={0.01}
          min={0.01}
          max={1}
          className={`${styles.input} px-2 py-1 w-20`}
          value={chartData.scale}
          clampOnBlur
          clampMin={false}
          onChange={updateScale}
        />
      </label>
    </div>
  );
}

export default ChartToolbarControls;
