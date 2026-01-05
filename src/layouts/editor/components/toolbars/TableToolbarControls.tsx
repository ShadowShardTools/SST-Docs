import type { Content, StyleTheme } from "@shadow-shard-tools/docs-core";
import { Columns2, LayoutGrid, Rows2, Table } from "lucide-react";
import Dropdown from "../../../common/components/Dropdown";

interface Props {
  data: any;
  onChange: (updater: (prev: Content) => Content) => void;
  styles: StyleTheme;
}

const OPTIONS = [
  {
    value: "blank",
    label: "No headers",
    icon: <Table className="w-4 h-4" />,
  },
  {
    value: "horizontal",
    label: "Row headers",
    icon: <Rows2 className="w-4 h-4" />,
  },
  {
    value: "vertical",
    label: "Column headers",
    icon: <Columns2 className="w-4 h-4" />,
  },
  {
    value: "matrix",
    label: "Matrix",
    icon: <LayoutGrid className="w-4 h-4" />,
  },
] as const;

export function TableToolbarControls({ data, onChange, styles }: Props) {
  const layout = data.type ?? "horizontal";

  return (
    <div className="flex items-center gap-1">
      <span>Layout</span>
      <Dropdown
        styles={styles}
        items={OPTIONS.map((option) => ({
          value: option.value,
          label: option.label,
          icon: option.icon,
        }))}
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
