import { Plus, Trash2 } from "lucide-react";
import type { StyleTheme } from "@shadow-shard-tools/docs-core/types/StyleTheme";
import Button from "../../../common/components/Button";
import type {
  EditableChartData,
  EditableChartDataset,
} from "./EditableChart.types";
import type { DraftColorState } from "./useDraftColors";
import { EditableChartColorField } from "./EditableChartColorField";
import NumericInput from "../../../common/components/NumericInput";

interface EditableChartDatasetsProps {
  chartData: EditableChartData;
  styles: StyleTheme;
  isPointChart: boolean;
  isBubble: boolean;
  isColorPerValue: boolean;
  defaultColor: string;
  onDatasetChange: (
    index: number,
    patch: Partial<EditableChartDataset>,
  ) => void;
  onAddDataset: () => void;
  onRemoveDataset: (index: number) => void;
  onPointChange: (
    datasetIndex: number,
    pointIndex: number,
    key: "x" | "y" | "r",
    value: number | undefined,
  ) => void;
  onAddPoint: (datasetIndex: number) => void;
  onRemovePoint: (datasetIndex: number, pointIndex: number) => void;
  onUpdateValueColor: (
    datasetIndex: number,
    valueIdx: number,
    key: "backgroundColor" | "borderColor",
    value: string,
  ) => void;
  ensureColorArray: (arr: any[] | undefined, length: number) => string[];
  draftColors: DraftColorState;
}

export function EditableChartDatasets({
  chartData,
  styles,
  isPointChart,
  isBubble,
  isColorPerValue,
  defaultColor,
  onDatasetChange,
  onAddDataset,
  onRemoveDataset,
  onPointChange,
  onAddPoint,
  onRemovePoint,
  onUpdateValueColor,
  ensureColorArray,
  draftColors,
}: EditableChartDatasetsProps) {
  const labels = chartData.labels ?? [];
  const valueGridClass = isColorPerValue
    ? "grid grid-cols-1 md:grid-cols-2 gap-4"
    : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2";
  const valueCardClass = isColorPerValue
    ? `flex flex-col gap-2 rounded-md border ${styles.input} p-2`
    : "flex flex-col gap-2";

  return (
    <div className="space-y-3">
      <span>Datasets</span>
      <div className="space-y-3">
        {(chartData.datasets ?? []).map((ds, dsIndex) => {
          const valueColors = isColorPerValue
            ? {
                background: ensureColorArray(
                  ds.backgroundColor as any[],
                  labels.length,
                ),
                border: ensureColorArray(
                  ds.borderColor as any[],
                  labels.length,
                ),
              }
            : null;

          return (
            <div key={dsIndex} className={`${styles.input} p-3 space-y-3`}>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <input
                  className={`${styles.input} px-2 py-1 flex-1 min-w-[10rem]`}
                  value={ds.label ?? ""}
                  onChange={(e) =>
                    onDatasetChange(dsIndex, { label: e.target.value })
                  }
                  placeholder="Dataset label"
                />
                {!isColorPerValue && (
                  <div className="flex items-center gap-2">
                    <EditableChartColorField
                      label="Bg"
                      labelClassName="text-xs"
                      draftKey={`ds-${dsIndex}-bg`}
                      fallback={
                        typeof ds.backgroundColor === "string"
                          ? ds.backgroundColor
                          : defaultColor
                      }
                      styles={styles}
                      draftColors={draftColors}
                      onCommit={(value) =>
                        onDatasetChange(dsIndex, {
                          backgroundColor: value,
                        })
                      }
                    />
                    <EditableChartColorField
                      label="Border"
                      labelClassName="text-xs"
                      draftKey={`ds-${dsIndex}-border`}
                      fallback={
                        typeof ds.borderColor === "string"
                          ? ds.borderColor
                          : defaultColor
                      }
                      styles={styles}
                      draftColors={draftColors}
                      onCommit={(value) =>
                        onDatasetChange(dsIndex, {
                          borderColor: value,
                        })
                      }
                    />
                  </div>
                )}
                <Button
                  type="button"
                  className="inline-flex items-center justify-center w-8 h-8"
                  styles={styles}
                  onClick={() => onRemoveDataset(dsIndex)}
                  aria-label={`Delete dataset ${dsIndex + 1}`}
                  title="Delete dataset"
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
              {!isPointChart ? (
                <div className={valueGridClass}>
                  {labels.map((label, valueIdx) => (
                    <div key={valueIdx} className={valueCardClass}>
                      <span className="truncate">
                        {label || `Label ${valueIdx + 1}`}
                      </span>
                      <NumericInput
                        className={`${styles.input} px-2 py-1`}
                        value={ds.data?.[valueIdx] as number | undefined}
                        onChange={(nextValue) => {
                          const nextData = [...(ds.data ?? [])];
                          nextData[valueIdx] = nextValue;
                          onDatasetChange(dsIndex, { data: nextData });
                        }}
                      />
                      {isColorPerValue && valueColors && (
                        <div className="flex flex-wrap gap-2">
                          <EditableChartColorField
                            label="Bg"
                            labelTextClassName={styles.text.alternative}
                            labelClassName="text-xs"
                            draftKey={`ds-${dsIndex}-val-${valueIdx}-bg`}
                            fallback={valueColors.background[valueIdx]}
                            styles={styles}
                            draftColors={draftColors}
                            onCommit={(value) =>
                              onUpdateValueColor(
                                dsIndex,
                                valueIdx,
                                "backgroundColor",
                                value,
                              )
                            }
                          />
                          <EditableChartColorField
                            label="Border"
                            labelTextClassName={styles.text.alternative}
                            labelClassName="text-xs"
                            draftKey={`ds-${dsIndex}-val-${valueIdx}-border`}
                            fallback={valueColors.border[valueIdx]}
                            styles={styles}
                            draftColors={draftColors}
                            onCommit={(value) =>
                              onUpdateValueColor(
                                dsIndex,
                                valueIdx,
                                "borderColor",
                                value,
                              )
                            }
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-1">
                  <span className={`${styles.text.alternative}`}>
                    {isBubble ? "Points (x,y,r)" : "Points (x,y)"}
                  </span>
                  <div className="space-y-2">
                    {((ds.data as any[]) ?? []).map((point, pointIdx) => (
                      <div key={pointIdx} className="flex gap-2">
                        <label className="flex items-center gap-1">
                          <span className={`${styles.text.alternative}`}>
                            X
                          </span>
                          <NumericInput
                            className={`${styles.input} px-2 py-1 w-24`}
                            value={point?.x as number | undefined}
                            onChange={(nextValue) =>
                              onPointChange(dsIndex, pointIdx, "x", nextValue)
                            }
                          />
                        </label>
                        <label className="flex items-center gap-1">
                          <span className={`${styles.text.alternative}`}>
                            Y
                          </span>
                          <NumericInput
                            className={`${styles.input} px-2 py-1 w-24`}
                            value={point?.y as number | undefined}
                            onChange={(nextValue) =>
                              onPointChange(dsIndex, pointIdx, "y", nextValue)
                            }
                          />
                        </label>
                        {isBubble && (
                          <label className="flex items-center gap-1">
                            <span className={`${styles.text.alternative}`}>
                              R
                            </span>
                            <NumericInput
                              className={`${styles.input} px-2 py-1 w-24`}
                              value={point?.r as number | undefined}
                              onChange={(nextValue) =>
                                onPointChange(
                                  dsIndex,
                                  pointIdx,
                                  "r",
                                  nextValue,
                                )
                              }
                            />
                          </label>
                        )}
                        <Button
                          type="button"
                          className="inline-flex items-center justify-center w-8 h-8"
                          styles={styles}
                          onClick={() => onRemovePoint(dsIndex, pointIdx)}
                          aria-label={`Delete point ${pointIdx + 1}`}
                          title="Delete point"
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    className="inline-flex items-center justify-center w-7 h-7"
                    styles={styles}
                    onClick={() => onAddPoint(dsIndex)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          );
        })}
        <Button
          type="button"
          className="inline-flex items-center justify-center w-7 h-7"
          styles={styles}
          onClick={onAddDataset}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
