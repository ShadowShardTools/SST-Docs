import { Plus, Trash2 } from "lucide-react";
import type { StyleTheme } from "@shadow-shard-tools/docs-core/types/StyleTheme";
import Button from "../../../common/components/Button";

interface EditableChartLabelsProps {
  labels: string[];
  styles: StyleTheme;
  onUpdateLabel: (index: number, value: string) => void;
  onRemoveLabel: (index: number) => void;
  onAddLabel: () => void;
}

export function EditableChartLabels({
  labels,
  styles,
  onUpdateLabel,
  onRemoveLabel,
  onAddLabel,
}: EditableChartLabelsProps) {
  return (
    <div className="space-y-2">
      <span>Labels</span>
      <div className="space-y-2">
        {labels.map((label, idx) => (
          <div key={idx} className="flex items-center gap-2 text-sm">
            <input
              className={`${styles.input} px-2 py-1 flex-1`}
              value={label}
              onChange={(e) => onUpdateLabel(idx, e.target.value)}
            />
            <Button
              type="button"
              className="inline-flex items-center justify-center w-8 h-8"
              styles={styles}
              onClick={() => onRemoveLabel(idx)}
              aria-label={`Delete label ${idx + 1}`}
              title="Delete label"
            >
              <Trash2 className="w-5 h-5" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          className="inline-flex items-center justify-center w-7 h-7"
          styles={styles}
          onClick={onAddLabel}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
