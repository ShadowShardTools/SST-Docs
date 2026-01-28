import type { StyleTheme } from "@shadow-shard-tools/docs-core/types/StyleTheme";
import type { DraftColorState } from "./useDraftColors";

interface EditableChartColorFieldProps {
  label: string;
  draftKey: string;
  fallback: string;
  styles: StyleTheme;
  draftColors: DraftColorState;
  onCommit: (value: string) => void;
  labelClassName?: string;
  labelTextClassName?: string;
}

export function EditableChartColorField({
  label,
  draftKey,
  fallback,
  styles,
  draftColors,
  onCommit,
  labelClassName,
  labelTextClassName,
}: EditableChartColorFieldProps) {
  const { getPickerColor, getDraftColor, setDraftColor, commitDraftColor } =
    draftColors;

  return (
    <label className={`inline-flex items-center gap-1 ${labelClassName ?? ""}`}>
      <span className={labelTextClassName}>{label}</span>
      <input
        type="color"
        className={`${styles.input} w-10 h-8 p-1`}
        value={getPickerColor(draftKey, fallback)}
        onChange={(e) => setDraftColor(draftKey, e.target.value)}
        onBlur={() => commitDraftColor(draftKey, onCommit)}
      />
      <input
        type="text"
        className={`${styles.input} h-8 px-2 text-[10px] font-mono w-20`}
        value={getDraftColor(draftKey, fallback).toUpperCase()}
        onChange={(e) => setDraftColor(draftKey, e.target.value.trim())}
        onBlur={() => commitDraftColor(draftKey, onCommit)}
      />
    </label>
  );
}
