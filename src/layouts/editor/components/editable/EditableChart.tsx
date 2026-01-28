import { Suspense, lazy, useMemo } from "react";
import type { StyleTheme } from "@shadow-shard-tools/docs-core/types/StyleTheme";
import type { ChartData } from "@shadow-shard-tools/docs-core/types/ChartData";
import { EditableChartLabels } from "./EditableChartLabels";
import { EditableChartDatasets } from "./EditableChartDatasets";
import { useEditableChartState } from "./useEditableChartState";
import { useDraftColors } from "./useDraftColors";
import { LoadingSpinner } from "../../../dialog/components";

const ChartBlock = lazy(() => import("../../../blocks/components/ChartBlock"));

interface EditableChartProps {
  data?: ChartData;
  styles: StyleTheme;
  onChange: (next: ChartData) => void;
}

export function EditableChart({ data, styles, onChange }: EditableChartProps) {
  const {
    chartData,
    isPointChart,
    isBubble,
    isColorPerValue,
    defaultColor,
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
  } = useEditableChartState(data, onChange);

  const draftColors = useDraftColors();

  const chartPreview = useMemo(
    () => (
      <Suspense fallback={<LoadingSpinner styles={styles} />}>
        <ChartBlock
          index={0}
          styles={styles}
          chartData={chartData as unknown as ChartData}
        />
      </Suspense>
    ),
    [chartData, styles],
  );

  return (
    <div className="space-y-4">
      {!isPointChart && (
        <EditableChartLabels
          labels={chartData.labels ?? []}
          styles={styles}
          onUpdateLabel={updateLabel}
          onRemoveLabel={removeLabel}
          onAddLabel={addLabel}
        />
      )}

      <EditableChartDatasets
        chartData={chartData}
        styles={styles}
        isPointChart={isPointChart}
        isBubble={isBubble}
        isColorPerValue={isColorPerValue}
        defaultColor={defaultColor}
        onDatasetChange={updateDataset}
        onAddDataset={addDataset}
        onRemoveDataset={removeDataset}
        onPointChange={handlePointChange}
        onAddPoint={addPoint}
        onRemovePoint={removePoint}
        onUpdateValueColor={updateValueColor}
        ensureColorArray={ensureColorArray}
        draftColors={draftColors}
      />
      {chartPreview}
    </div>
  );
}

export default EditableChart;
