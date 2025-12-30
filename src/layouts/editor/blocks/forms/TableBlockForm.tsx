import type { Content } from "@shadow-shard-tools/docs-core";

type TableBlock = Extract<Content, { type: "table" }>;

interface Props {
  block: TableBlock;
  onChange: (updated: TableBlock) => void;
}

export function TableBlockForm({ block, onChange }: Props) {
  const data = block.tableData ?? { type: "horizontal", data: [] };
  const rows = data.data ?? [];

  const updateCell = (r: number, c: number, value: string) => {
    const next = rows.map((row, ri) =>
      row.map((cell, ci) =>
        ri === r && ci === c ? { ...cell, content: value } : cell,
      ),
    );
    onChange({
      ...block,
      tableData: { ...data, data: next },
    });
  };

  const addRow = () => {
    const cols = rows[0]?.length ?? 2;
    const newRow = Array.from({ length: cols }, () => ({ content: "" }));
    onChange({
      ...block,
      tableData: { ...data, data: [...rows, newRow] },
    });
  };

  const addColumn = () => {
    const next = rows.map((row) => [...row, { content: "" }]);
    if (next.length === 0) {
      next.push([{ content: "" }, { content: "" }]);
    }
    onChange({
      ...block,
      tableData: { ...data, data: next },
    });
  };

  const removeRowAt = (index: number) => {
    if (rows.length === 0) return;
    const next = rows.filter((_, i) => i !== index);
    onChange({
      ...block,
      tableData: { ...data, data: next },
    });
  };

  const removeColumnAt = (colIndex: number) => {
    if (rows.length === 0) return;
    const next = rows
      .map((row) => row.filter((_, ci) => ci !== colIndex))
      .filter((row) => row.length > 0);
    onChange({
      ...block,
      tableData: { ...data, data: next },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="font-medium">Type</span>
        <div className="inline-flex rounded border overflow-hidden bg-white dark:bg-slate-900">
          {(["horizontal", "vertical", "matrix"] as const).map((type) => (
            <button
              key={type}
              type="button"
              className={`px-3 py-1.5 text-sm border-r last:border-r-0 ${
                (data.type ?? "horizontal") === type
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                  : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
              }`}
              onClick={() =>
                onChange({
                  ...block,
                  tableData: { ...data, type },
                })
              }
            >
              {type}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="px-3 py-1.5 border rounded"
          onClick={addRow}
        >
          + Add row
        </button>
        <button
          type="button"
          className="px-3 py-1.5 border rounded"
          onClick={addColumn}
        >
          + Add column
        </button>
      </div>

      <div className="overflow-auto border rounded">
        <table className="min-w-full border-collapse">
          {rows.length > 0 && (
            <thead>
              <tr>
                <th className="border p-1 w-10" />
                {rows[0].map((_, ci) => (
                  <th key={ci} className="border p-1 text-xs text-left">
                    <button
                      type="button"
                      className="px-2 py-1 border rounded text-xs"
                      onClick={() => removeColumnAt(ci)}
                      disabled={rows[0].length <= 1}
                    >
                      Remove
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {rows.map((row, r) => (
              <tr key={r}>
                <td className="border p-1 align-top w-10">
                  <button
                    type="button"
                    className="px-2 py-1 border rounded text-xs"
                    onClick={() => removeRowAt(r)}
                  >
                    Remove
                  </button>
                </td>
                {row.map((cell, c) => (
                  <td key={c} className="border p-2 align-top">
                    <textarea
                      className="w-full min-h-[50px] border rounded p-2 text-sm"
                      value={cell.content ?? ""}
                      onChange={(e) => updateCell(r, c, e.target.value)}
                    />
                  </td>
                ))}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td className="p-4 text-sm text-slate-500">
                  Table is empty. Add a row to start editing cells.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TableBlockForm;
