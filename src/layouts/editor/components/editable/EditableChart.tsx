import { useMemo } from "react";
import ChartBlock from "../../../blocks/components/ChartBlock";
import type { StyleTheme } from "@shadow-shard-tools/docs-core/types/StyleTheme";
import type { ChartData } from "@shadow-shard-tools/docs-core/types/ChartData";
import { Plus, Trash2 } from "lucide-react";

type EditableChartDataset = {
  label: string;
  data: any[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
};

type EditableChartData = Omit<ChartData, "datasets"> & {
  datasets: EditableChartDataset[];
};

interface EditableChartProps {
  data?: ChartData;
  styles: StyleTheme;
  onChange: (next: ChartData) => void;
}

export function EditableChart({ data, styles, onChange }: EditableChartProps) {
  const COLOR_PER_VALUE_TYPES: ChartData["type"][] = [
    "pie",
    "doughnut",
    "polarArea",
  ];
  const defaultColor = "#ffffff";

  const chartData: EditableChartData = useMemo(
    () => ({
      type: "bar",
      labels: ["Label 1", "Label 2", "Label 3"],
      datasets: [{ label: "Dataset", data: [10, 20, 30] }],
      alignment: "center",
      scale: 1,
      ...(data as any),
    }),
    [data],
  );

  const updateChart = (partial: Partial<EditableChartData>) =>
    onChange({ ...(chartData as any), ...partial } as ChartData);
  const updateDatasets = (
    updater: (ds: EditableChartDataset, idx: number) => EditableChartDataset,
  ) => {
    const next = (chartData.datasets ?? []).map((ds, idx) => updater(ds, idx));
    updateChart({ datasets: next });
  };
  const updateDatasetAt = (
    index: number,
    updater: (ds: EditableChartDataset) => EditableChartDataset,
  ) =>
    updateDatasets((ds, idx) =>
      idx === index ? { ...ds, ...updater(ds) } : ds,
    );

  const handleDatasetChange = (index: number, updater: any) =>
    updateDatasetAt(index, () => updater);

  const handlePointChange = (
    datasetIndex: number,
    pointIndex: number,
    key: "x" | "y",
    value: number,
  ) => {
    updateDatasetAt(datasetIndex, (ds) => {
      const points = [...((ds?.data as any[]) ?? [])];
      const current = points[pointIndex] ?? { x: 0, y: 0 };
      points[pointIndex] = { ...current, [key]: value };
      return { ...ds, data: points };
    });
  };

  const addPoint = (datasetIndex: number) => {
    updateDatasetAt(datasetIndex, (ds) => {
      const points = [...((ds?.data as any[]) ?? [])];
      points.push({ x: 0, y: 0 });
      return { ...ds, data: points };
    });
  };

  const removePoint = (datasetIndex: number, pointIndex: number) => {
    updateDatasetAt(datasetIndex, (ds) => {
      const points = [...((ds?.data as any[]) ?? [])].filter(
        (_, i) => i !== pointIndex,
      );
      return { ...ds, data: points };
    });
  };

  const addDataset = () => {
    const labels = chartData.labels ?? [];
    const isColorPerValue = COLOR_PER_VALUE_TYPES.includes(
      chartData.type ?? "bar",
    );
    const next = [...(chartData.datasets ?? [])];
    next.push({
      label: `Dataset ${next.length + 1}`,
      data:
        chartData.type === "scatter" ? [{ x: 0, y: 0 }] : labels.map(() => 0),
      ...(isColorPerValue
        ? {
            backgroundColor: labels.map(() => defaultColor),
            borderColor: labels.map(() => defaultColor),
          }
        : {}),
    });
    updateChart({ datasets: next });
  };

  const removeDataset = (index: number) => {
    const next = (chartData.datasets ?? []).filter((_, i) => i !== index);
    updateChart({ datasets: next });
  };

  const updateLabel = (index: number, value: string) => {
    const next = [...(chartData.labels ?? [])];
    next[index] = value;
    updateChart({ labels: next });
  };

  const addLabel = () => {
    const isColorPerValue = COLOR_PER_VALUE_TYPES.includes(
      chartData.type ?? "bar",
    );
    const nextLabels = [
      ...(chartData.labels ?? []),
      `Label ${(chartData.labels?.length ?? 0) + 1}`,
    ];
    const nextDatasets = (chartData.datasets ?? []).map((ds) => {
      const nextData = [...(ds.data ?? []), 0];
      if (isColorPerValue) {
        const nextBg = Array.isArray(ds.backgroundColor)
          ? [...ds.backgroundColor, defaultColor]
          : [defaultColor];
        const nextBorder = Array.isArray(ds.borderColor)
          ? [...ds.borderColor, defaultColor]
          : [defaultColor];
        return {
          ...ds,
          data: nextData,
          backgroundColor: nextBg,
          borderColor: nextBorder,
        };
      }
      return { ...ds, data: nextData };
    });
    updateChart({ labels: nextLabels, datasets: nextDatasets });
  };

  const removeLabel = (index: number) => {
    const isColorPerValue = COLOR_PER_VALUE_TYPES.includes(
      chartData.type ?? "bar",
    );
    const nextLabels = (chartData.labels ?? []).filter((_, i) => i !== index);
    const nextDatasets = (chartData.datasets ?? []).map((ds) => ({
      ...ds,
      data: (ds.data ?? []).filter((_, i) => i !== index),
      ...(isColorPerValue
        ? {
            backgroundColor: Array.isArray(ds.backgroundColor)
              ? ds.backgroundColor.filter((_, i) => i !== index)
              : undefined,
            borderColor: Array.isArray(ds.borderColor)
              ? ds.borderColor.filter((_, i) => i !== index)
              : undefined,
          }
        : {}),
    }));
    updateChart({ labels: nextLabels, datasets: nextDatasets });
  };

  const isScatter = chartData.type === "scatter";
  const isColorPerValue = COLOR_PER_VALUE_TYPES.includes(
    chartData.type ?? "bar",
  );

  const ensureColorArray = (arr: any[] | undefined, length: number) => {
    const base = Array.isArray(arr) ? [...arr] : [];
    const next = Array.from({ length }, (_, i) => base[i] ?? defaultColor);
    return next.slice(0, length);
  };

  const updateValueColor = (
    datasetIndex: number,
    valueIdx: number,
    key: "backgroundColor" | "borderColor",
    value: string,
  ) => {
    const length = chartData.labels?.length ?? 0;
    const nextColors = ensureColorArray(
      (chartData.datasets?.[datasetIndex] as any)?.[key],
      length,
    );
    nextColors[valueIdx] = value || defaultColor;
    handleDatasetChange(datasetIndex, { [key]: nextColors });
  };

  return (
    <div className="space-y-4">
      {!isScatter && (
        <div className="space-y-2">
          <span>Labels</span>
          <div className="space-y-2">
            {(chartData.labels ?? []).map((label, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm">
                <input
                  className={`${styles.input} px-2 py-1 flex-1`}
                  value={label}
                  onChange={(e) => updateLabel(idx, e.target.value)}
                />
                <button
                  type="button"
                  className={`inline-flex items-center justify-center w-8 h-8 ${styles.buttons.common}`}
                  onClick={() => removeLabel(idx)}
                  aria-label={`Delete label ${idx + 1}`}
                  title="Delete label"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
            <button
              type="button"
              className={`inline-flex items-center justify-center w-7 h-7 ${styles.buttons.common}`}
              onClick={addLabel}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <span>Datasets</span>
        <div className="space-y-3">
          {(chartData.datasets ?? []).map((ds, dsIndex) => (
            <div
              key={dsIndex}
              className={`${styles.input} px-2 py-1`}
            >
              <div className="flex items-center gap-2 text-sm">
                <input
                  className={`${styles.input} px-2 py-1`}
                  value={ds.label ?? ""}
                  onChange={(e) =>
                    handleDatasetChange(dsIndex, { label: e.target.value })
                  }
                  placeholder="Dataset label"
                />
                {!isColorPerValue && (
                  <>
                    <input
                      className={`${styles.input} px-2 py-1`}
                      value={ds.backgroundColor ?? ""}
                      onChange={(e) =>
                        handleDatasetChange(dsIndex, {
                          backgroundColor: e.target.value,
                        })
                      }
                      placeholder="Background color"
                    />
                    <input
                      className={`${styles.input} px-2 py-1`}
                      value={ds.borderColor ?? ""}
                      onChange={(e) =>
                        handleDatasetChange(dsIndex, {
                          borderColor: e.target.value,
                        })
                      }
                      placeholder="Border color"
                    />
                  </>
                )}
                <button
                  type="button"
                  className={`inline-flex items-center justify-center w-8 h-8 ${styles.buttons.common}`}
                  onClick={() => removeDataset(dsIndex)}
                  aria-label={`Delete dataset ${dsIndex + 1}`}
                  title="Delete dataset"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              {!isScatter ? (
                <div className="space-y-1">
                  <span className="text-xs text-slate-500">
                    Values (match labels)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {(chartData.labels ?? []).map((label, valueIdx) => (
                      <label
                        key={valueIdx}
                        className="flex flex-col gap-1"
                      >
                        <span className="truncate">
                          {label || `Label ${valueIdx + 1}`}
                        </span>
                        <input
                          type="number"
                          className={`${styles.input} px-2 py-1`}
                          value={ds.data?.[valueIdx] ?? 0}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            const nextData = [...(ds.data ?? [])];
                            nextData[valueIdx] = Number.isFinite(val) ? val : 0;
                            handleDatasetChange(dsIndex, { data: nextData });
                          }}
                        />
                        {isColorPerValue && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                            <input
                              className={`${styles.input} px-2 py-1`}
                              value={
                                ensureColorArray(
                                  ds.backgroundColor as any[],
                                  chartData.labels?.length ?? 0,
                                )[valueIdx]
                              }
                              onChange={(e) => {
                                updateValueColor(
                                  dsIndex,
                                  valueIdx,
                                  "backgroundColor",
                                  e.target.value,
                                );
                              }}
                              placeholder="Background color"
                            />
                            <input
                              className={`${styles.input} px-2 py-1`}
                              value={
                                ensureColorArray(
                                  ds.borderColor as any[],
                                  chartData.labels?.length ?? 0,
                                )[valueIdx]
                              }
                              onChange={(e) => {
                                updateValueColor(
                                  dsIndex,
                                  valueIdx,
                                  "borderColor",
                                  e.target.value,
                                );
                              }}
                              placeholder="Border color"
                            />
                          </div>
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <span>Points (x,y)</span>
                  <div className="space-y-2">
                    {((ds.data as any[]) ?? []).map((point, pointIdx) => (
                      <div
                        key={pointIdx}
                        className="flex gap-2"
                      >
                        <label className="flex items-center gap-1">
                          <span>X</span>
                          <input
                            type="number"
                            className={`${styles.input} px-2 py-1 w-24`}
                            value={point?.x ?? 0}
                            onChange={(e) =>
                              handlePointChange(
                                dsIndex,
                                pointIdx,
                                "x",
                                Number.isFinite(Number(e.target.value))
                                  ? Number(e.target.value)
                                  : 0,
                              )
                            }
                          />
                        </label>
                        <label className="flex items-center gap-1">
                          <span>Y</span>
                          <input
                            type="number"
                            className={`${styles.input} px-2 py-1 w-24`}
                            value={point?.y ?? 0}
                            onChange={(e) =>
                              handlePointChange(
                                dsIndex,
                                pointIdx,
                                "y",
                                Number.isFinite(Number(e.target.value))
                                  ? Number(e.target.value)
                                  : 0,
                              )
                            }
                          />
                        </label>
                        <button
                          type="button"
                          className={`inline-flex items-center justify-center w-8 h-8 ${styles.buttons.common}`}
                          onClick={() => removePoint(dsIndex, pointIdx)}
                          aria-label={`Delete point ${pointIdx + 1}`}
                          title="Delete point"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    className={`inline-flex items-center justify-center w-7 h-7 ${styles.buttons.common}`}
                    onClick={() => addPoint(dsIndex)}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
          <button
            type="button"
            className={`inline-flex items-center justify-center w-7 h-7 ${styles.buttons.common}`}
            onClick={addDataset}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
        <ChartBlock
          index={0}
          styles={styles}
          chartData={chartData as unknown as ChartData}
        />
    </div>
  );
}

export default EditableChart;
