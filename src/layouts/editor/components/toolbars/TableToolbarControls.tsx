import type { Content, StyleTheme } from "@shadow-shard-tools/docs-core";
import Dropdown from "../../../common/components/Dropdown";

interface Props {
  data: any;
  onChange: (updater: (prev: Content) => Content) => void;
  styles: StyleTheme;
}

const OPTIONS = [
  { value: "blank", label: "No headers" },
  { value: "horizontal", label: "Row headers" },
  { value: "vertical", label: "Column headers" },
  { value: "matrix", label: "Matrix" },
] as const;

export function TableToolbarControls({ data, onChange, styles }: Props) {
  const layout = data.type ?? "horizontal";

  return (
    <div className="flex items-center gap-1">
      <span>Layout</span>
      <Dropdown
        styles={styles}
        items={OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
        selectedValue={layout}
        onSelect={(val) =>
          onChange((prev) => ({
            ...prev,
            tableData: {
              ...(prev as any).tableData,
              type: val,
            },
          }))
        }
        className="min-w-[150px]"
      />
    </div>
  );
}

export default TableToolbarControls;
