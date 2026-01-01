import { ALIGNMENT_CLASSES } from "@shadow-shard-tools/docs-core";
import { useMemo } from "react";
import ChartBlock from "../../../blocks/components/ChartBlock";
import type { StyleTheme } from "@shadow-shard-tools/docs-core/types/StyleTheme";
import type { ChartData } from "@shadow-shard-tools/docs-core/types/ChartData";

interface EditableChartProps {
  data?: ChartData;
  styles: StyleTheme;
  onChange: (next: ChartData) => void;
}

export function EditableChart({ data, styles, onChange }: EditableChartProps) {
  const chartData: ChartData = useMemo(
    () => ({
      type: "bar",
      labels: ["Label 1", "Label 2", "Label 3"],
      datasets: [{ label: "Dataset", data: [10, 20, 30] }],
      alignment: "center",
      scale: 1,
      ...data,
    }),
    [data],
  );

  const handleDatasetChange = (index: number, updater: any) => {
    const next = [...(chartData.datasets ?? [])];
    next[index] = { ...next[index], ...updater };
    onChange({ ...chartData, datasets: next });
  };

  const handlePointChange = (
    datasetIndex: number,
    pointIndex: number,
    key: "x" | "y",
    value: number,
  ) => {
    const next = [...(chartData.datasets ?? [])];
    const points = [...((next[datasetIndex]?.data as any[]) ?? [])];
    const current = points[pointIndex] ?? { x: 0, y: 0 };
    points[pointIndex] = { ...current, [key]: value };
    next[datasetIndex] = { ...next[datasetIndex], data: points };
    onChange({ ...chartData, datasets: next });
  };

  const addPoint = (datasetIndex: number) => {
    const next = [...(chartData.datasets ?? [])];
    const points = [...((next[datasetIndex]?.data as any[]) ?? [])];
    points.push({ x: 0, y: 0 });
    next[datasetIndex] = { ...next[datasetIndex], data: points };
    onChange({ ...chartData, datasets: next });
  };

  const removePoint = (datasetIndex: number, pointIndex: number) => {
    const next = [...(chartData.datasets ?? [])];
    const points = [...((next[datasetIndex]?.data as any[]) ?? [])].filter(
      (_, i) => i !== pointIndex,
    );
    next[datasetIndex] = { ...next[datasetIndex], data: points };
    onChange({ ...chartData, datasets: next });
  };

  const addDataset = () => {
    const next = [...(chartData.datasets ?? [])];
    next.push({
      label: `Dataset ${next.length + 1}`,
      data:
        chartData.type === "scatter"
          ? [{ x: 0, y: 0 }]
          : chartData.labels?.map(() => 0) ?? [0],
    });
    onChange({ ...chartData, datasets: next });
  };

  const removeDataset = (index: number) => {
    const next = (chartData.datasets ?? []).filter((_, i) => i !== index);
    onChange({ ...chartData, datasets: next });
  };

  const updateLabel = (index: number, value: string) => {
    const next = [...(chartData.labels ?? [])];
    next[index] = value;
    onChange({ ...chartData, labels: next });
  };

  const addLabel = () => {
    const nextLabels = [...(chartData.labels ?? []), `Label ${chartData.labels?.length ?? 0 + 1}`];
    const nextDatasets = (chartData.datasets ?? []).map((ds) => ({
      ...ds,
      data: [...(ds.data ?? []), 0],
    }));
    onChange({ ...chartData, labels: nextLabels, datasets: nextDatasets });
  };

  const removeLabel = (index: number) => {
    const nextLabels = (chartData.labels ?? []).filter((_, i) => i !== index);
    const nextDatasets = (chartData.datasets ?? []).map((ds) => ({
      ...ds,
      data: (ds.data ?? []).filter((_, i) => i !== index),
    }));
    onChange({ ...chartData, labels: nextLabels, datasets: nextDatasets });
  };

  const isScatter = chartData.type === "scatter";

  return (
    <div className="space-y-4">
      {!isScatter && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <span>Labels</span>
            <button
              type="button"
              className="px-2 py-1 border rounded text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={addLabel}
            >
              + Label
            </button>
          </div>
          <div className="space-y-2">
            {(chartData.labels ?? []).map((label, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm">
                <input
                  className="border rounded px-2 py-1 flex-1 bg-white dark:bg-slate-900"
                  value={label}
                  onChange={(e) => updateLabel(idx, e.target.value)}
                />
                <button
                  type="button"
                  className="px-2 py-1 border rounded text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                  onClick={() => removeLabel(idx)}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs">
          <span>Datasets</span>
          <button
            type="button"
            className="px-2 py-1 border rounded text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
            onClick={addDataset}
          >
            + Dataset
          </button>
        </div>
        <div className="space-y-3">
          {(chartData.datasets ?? []).map((ds, dsIndex) => (
            <div key={dsIndex} className="border rounded p-3 space-y-2 bg-white/60 dark:bg-slate-900/60">
              <div className="flex items-center gap-2 text-sm">
                <input
                  className="border rounded px-2 py-1 flex-1 bg-white dark:bg-slate-900"
                  value={ds.label ?? ""}
                  onChange={(e) => handleDatasetChange(dsIndex, { label: e.target.value })}
                  placeholder="Dataset label"
                />
                <input
                  className="border rounded px-2 py-1 text-sm bg-white dark:bg-slate-900 w-32"
                  value={ds.backgroundColor ?? ""}
                  onChange={(e) => handleDatasetChange(dsIndex, { backgroundColor: e.target.value })}
                  placeholder="Background color"
                />
                <input
                  className="border rounded px-2 py-1 text-sm bg-white dark:bg-slate-900 w-32"
                  value={ds.borderColor ?? ""}
                  onChange={(e) => handleDatasetChange(dsIndex, { borderColor: e.target.value })}
                  placeholder="Border color"
                />
                <button
                  type="button"
                  className="px-2 py-1 border rounded text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                  onClick={() => removeDataset(dsIndex)}
                >
                  Delete
                </button>
              </div>
              {!isScatter ? (
                <div className="space-y-1">
                  <span className="text-xs text-slate-500">Values (match labels)</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {(chartData.labels ?? []).map((label, valueIdx) => (
                      <label
                        key={valueIdx}
                        className="flex flex-col gap-1 text-xs text-slate-600 bg-white/60 dark:bg-slate-900/60 rounded border px-2 py-1"
                      >
                        <span className="truncate">{label || `Label ${valueIdx + 1}`}</span>
                        <input
                          type="number"
                          className="border rounded px-2 py-1 bg-white dark:bg-slate-900 text-sm"
                          value={ds.data?.[valueIdx] ?? 0}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            const nextData = [...(ds.data ?? [])];
                            nextData[valueIdx] = Number.isFinite(val) ? val : 0;
                            handleDatasetChange(dsIndex, { data: nextData });
                          }}
                        />
                      </label>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span>Points (x,y)</span>
                    <button
                      type="button"
                      className="px-2 py-1 border rounded text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
                      onClick={() => addPoint(dsIndex)}
                    >
                      + Point
                    </button>
                  </div>
                  <div className="space-y-2">
                    {((ds.data as any[]) ?? []).map((point, pointIdx) => (
                      <div
                        key={pointIdx}
                        className="flex items-center gap-2 text-xs bg-white/60 dark:bg-slate-900/60 rounded border px-2 py-1"
                      >
                        <label className="flex items-center gap-1">
                          <span>X</span>
                          <input
                            type="number"
                            className="border rounded px-2 py-1 bg-white dark:bg-slate-900 text-sm w-24"
                            value={point?.x ?? 0}
                            onChange={(e) =>
                              handlePointChange(
                                dsIndex,
                                pointIdx,
                                "x",
                                Number.isFinite(Number(e.target.value)) ? Number(e.target.value) : 0,
                              )
                            }
                          />
                        </label>
                        <label className="flex items-center gap-1">
                          <span>Y</span>
                          <input
                            type="number"
                            className="border rounded px-2 py-1 bg-white dark:bg-slate-900 text-sm w-24"
                            value={point?.y ?? 0}
                            onChange={(e) =>
                              handlePointChange(
                                dsIndex,
                                pointIdx,
                                "y",
                                Number.isFinite(Number(e.target.value)) ? Number(e.target.value) : 0,
                              )
                            }
                          />
                        </label>
                        <button
                          type="button"
                          className="ml-auto px-2 py-1 border rounded text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                          onClick={() => removePoint(dsIndex, pointIdx)}
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div
        className={`rounded border px-3 py-2 ${ALIGNMENT_CLASSES[chartData.alignment ?? "center"].container}`}
      >
        <ChartBlock index={0} styles={styles} chartData={chartData} />
      </div>
    </div>
  );
}

export default EditableChart;
