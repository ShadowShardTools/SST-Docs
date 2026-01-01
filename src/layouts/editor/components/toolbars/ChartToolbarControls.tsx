import type { Content } from "@shadow-shard-tools/docs-core";
import type { ChartData } from "@shadow-shard-tools/docs-core/types/ChartData";

interface Props {
  data: any;
  onChange: (updater: (prev: Content) => Content) => void;
}

export function ChartToolbarControls({ data, onChange }: Props) {
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
      <label className="flex items-center gap-1">
        <span>Type</span>
        <select
          className="border rounded px-1.5 py-0.5 bg-white dark:bg-slate-800"
          value={chartData.type ?? "bar"}
          onChange={(e) => updateType(e.target.value as ChartData["type"])}
        >
          <option value="bar">Bar</option>
          <option value="line">Line</option>
          <option value="pie">Pie</option>
          <option value="doughnut">Doughnut</option>
          <option value="radar">Radar</option>
          <option value="polarArea">Polar area</option>
          <option value="bubble">Bubble</option>
          <option value="scatter">Scatter</option>
        </select>
      </label>

      <label className="flex items-center gap-1">
        <span>Align</span>
        <select
          className="border rounded px-1.5 py-0.5 bg-white dark:bg-slate-800"
          value={chartData.alignment ?? "center"}
          onChange={(e) => toggleAlignment(e.target.value as ChartData["alignment"])}
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </label>

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
