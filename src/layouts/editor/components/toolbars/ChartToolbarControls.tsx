import type { Content, StyleTheme } from "@shadow-shard-tools/docs-core";
import type { ChartData } from "@shadow-shard-tools/docs-core/types/ChartData";
import Dropdown from "../../../common/components/Dropdown";

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

  const updateScale = (scale: number) =>
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
            { value: "bar", label: "Bar" },
            { value: "line", label: "Line" },
            { value: "pie", label: "Pie" },
            { value: "doughnut", label: "Doughnut" },
            { value: "radar", label: "Radar" },
            { value: "polarArea", label: "Polar area" },
            { value: "bubble", label: "Bubble" },
            { value: "scatter", label: "Scatter" },
          ]}
          selectedValue={(chartData.type as string) ?? "bar"}
          onSelect={(val) => updateType(val as ChartData["type"])}
          className="min-w-[140px]"
        />
      </div>

      <div className="flex items-center gap-1">
        <span>Align</span>
        <Dropdown
          styles={styles}
          items={[
            { value: "left", label: "Left" },
            { value: "center", label: "Center" },
            { value: "right", label: "Right" },
          ]}
          selectedValue={(chartData.alignment as string) ?? "center"}
          onSelect={(val) => toggleAlignment(val as ChartData["alignment"])}
          className="min-w-[120px]"
        />
      </div>

      <label className="flex items-center gap-1">
        <span>Scale</span>
        <input
          type="number"
          step={0.01}
          min={0.01}
          max={1}
          className="border rounded px-1.5 py-0.5 bg-white dark:bg-slate-800 w-20"
          value={chartData.scale ?? 1}
          onChange={(e) => updateScale(Math.min(Number.parseFloat(e.target.value) || 1, 1))}
        />
      </label>
    </div>
  );
}

export default ChartToolbarControls;
