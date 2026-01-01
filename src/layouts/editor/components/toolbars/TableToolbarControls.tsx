import type { Content } from "@shadow-shard-tools/docs-core";

interface Props {
  data: any;
  onChange: (updater: (prev: Content) => Content) => void;
}

const OPTIONS = [
  { value: "blank", label: "No headers" },
  { value: "horizontal", label: "Row headers" },
  { value: "vertical", label: "Column headers" },
  { value: "matrix", label: "Matrix" },
] as const;

export function TableToolbarControls({ data, onChange }: Props) {
  const layout = data.type ?? "horizontal";

  return (
    <label className="flex items-center gap-1">
      <span>Layout</span>
      <select
        className="border rounded px-1.5 py-0.5 bg-white dark:bg-slate-800"
        value={layout}
        onChange={(e) =>
          onChange((prev) => ({
            ...prev,
            tableData: {
              ...(prev as any).tableData,
              type: e.target.value,
            },
          }))
        }
      >
        {OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default TableToolbarControls;

