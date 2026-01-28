import { useMemo } from "react";
import type { ChartData } from "@shadow-shard-tools/docs-core/types/ChartData";
import type {
  EditableChartData,
  EditableChartDataset,
} from "./EditableChart.types";

const COLOR_PER_VALUE_TYPES: ChartData["type"][] = [
  "pie",
  "doughnut",
  "polarArea",
];
const DEFAULT_COLOR = "#ffffff";

const createDefaultData = (data?: ChartData): EditableChartData => ({
  type: "bar",
  labels: ["Label 1", "Label 2", "Label 3"],
  datasets: [{ label: "Dataset", data: [10, 20, 30] }],
  alignment: "center",
  scale: 1,
  ...(data as any),
});

const getPointSeed = (type?: ChartData["type"]) =>
  type === "bubble" ? { x: 0, y: 0, r: 10 } : { x: 0, y: 0 };

export const useEditableChartState = (
  data: ChartData | undefined,
  onChange: (next: ChartData) => void,
) => {
  const chartData = useMemo(() => createDefaultData(data), [data]);

  const updateChart = (partial: Partial<EditableChartData>) =>
    onChange({ ...(chartData as any), ...partial } as ChartData);

  const updateDatasets = (
    updater: (ds: EditableChartDataset, idx: number) => EditableChartDataset,
  ) => {
    const next = (chartData.datasets ?? []).map((ds, idx) => updater(ds, idx));
    updateChart({ datasets: next });
  };

  const updateDataset = (index: number, patch: Partial<EditableChartDataset>) =>
    updateDatasets((ds, idx) => (idx === index ? { ...ds, ...patch } : ds));

  const handlePointChange = (
    datasetIndex: number,
    pointIndex: number,
    key: "x" | "y" | "r",
    value: number,
  ) => {
    updateDataset(datasetIndex, {
      data: ((chartData.datasets?.[datasetIndex]?.data as any[]) ?? []).map(
        (point, idx) => {
          if (idx !== pointIndex) return point;
          const current = point ?? { x: 0, y: 0 };
          return { ...current, [key]: value };
        },
      ),
    });
  };

  const addPoint = (datasetIndex: number) => {
    const pointSeed = getPointSeed(chartData.type);
    updateDataset(datasetIndex, {
      data: [
        ...((chartData.datasets?.[datasetIndex]?.data as any[]) ?? []),
        pointSeed,
      ],
    });
  };

  const removePoint = (datasetIndex: number, pointIndex: number) => {
    updateDataset(datasetIndex, {
      data: ((chartData.datasets?.[datasetIndex]?.data as any[]) ?? []).filter(
        (_, i) => i !== pointIndex,
      ),
    });
  };

  const addDataset = () => {
    const labels = chartData.labels ?? [];
    const isColorPerValue = COLOR_PER_VALUE_TYPES.includes(
      chartData.type ?? "bar",
    );
    const isPointChart =
      chartData.type === "scatter" || chartData.type === "bubble";
    const pointSeed = getPointSeed(chartData.type);
    const next = [...(chartData.datasets ?? [])];

    next.push({
      label: `Dataset ${next.length + 1}`,
      data: isPointChart ? [pointSeed] : labels.map(() => 0),
      ...(isColorPerValue
        ? {
            backgroundColor: labels.map(() => DEFAULT_COLOR),
            borderColor: labels.map(() => DEFAULT_COLOR),
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
          ? [...ds.backgroundColor, DEFAULT_COLOR]
          : [DEFAULT_COLOR];
        const nextBorder = Array.isArray(ds.borderColor)
          ? [...ds.borderColor, DEFAULT_COLOR]
          : [DEFAULT_COLOR];
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

  const isPointChart =
    chartData.type === "scatter" || chartData.type === "bubble";
  const isBubble = chartData.type === "bubble";
  const isColorPerValue = COLOR_PER_VALUE_TYPES.includes(
    chartData.type ?? "bar",
  );

  const ensureColorArray = (arr: any[] | undefined, length: number) => {
    const base = Array.isArray(arr) ? [...arr] : [];
    const next = Array.from({ length }, (_, i) => base[i] ?? DEFAULT_COLOR);
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
    nextColors[valueIdx] = value || DEFAULT_COLOR;
    updateDataset(datasetIndex, { [key]: nextColors });
  };

  return {
    chartData,
    isPointChart,
    isBubble,
    isColorPerValue,
    defaultColor: DEFAULT_COLOR,
    updateLabel,
    addLabel,
    removeLabel,
    updateDataset,
    addDataset,
    removeDataset,
    handlePointChange,
    addPoint,
    removePoint,
    ensureColorArray,
    updateValueColor,
  } as const;
};
