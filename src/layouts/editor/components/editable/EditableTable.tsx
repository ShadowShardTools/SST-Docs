import type {
  StyleTheme,
  TableCell,
  TableData,
} from "@shadow-shard-tools/docs-core";
import { useEffect, useMemo, useRef } from "react";

interface EditableTableProps {
  data?: TableData;
  styles: StyleTheme;
  onChange: (next: TableData) => void;
}

const ensureTableData = (incoming?: TableData): TableData => {
  if (!incoming?.data?.length) {
    return { type: "horizontal", data: [[{ content: "" }]] };
  }

  const normalizedRows = incoming.data.map((row) =>
    row?.length
      ? row.map((cell) => ({
          content: cell?.content ?? "",
          scope: cell?.scope,
        }))
      : [{ content: "" }],
  );

  return {
    type: incoming.type ?? "horizontal",
    data: normalizedRows,
  };
};

function EditableTableCell({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && ref.current.innerText !== value) {
      ref.current.innerText = value ?? "";
    }
  }, [value]);

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      className="min-w-[6rem] bg-transparent outline-none px-1 py-0.5 rounded focus:ring-1 focus:ring-sky-400"
      onInput={(e) => onChange((e.target as HTMLElement).innerText)}
    />
  );
}

export function EditableTable({ data, styles, onChange }: EditableTableProps) {
  const tableData = useMemo(() => ensureTableData(data), [data]);
  const tableType = tableData.type ?? "horizontal";
  const columnCount = tableData.data.reduce(
    (max, row) => Math.max(max, row.length),
    tableData.data[0]?.length ?? 1,
  );
  const rowCount = tableData.data.length;

  const emitChange = (next: TableData) => {
    onChange({
      ...next,
      data: next.data.map((row) => row.map((cell) => ({ ...cell }))),
    });
  };

  const updateCell = (
    rowIndex: number,
    colIndex: number,
    updater: (prev: TableCell) => TableCell,
  ) => {
    const nextRows = tableData.data.map((row, r) =>
      row.map((cell, c) =>
        r === rowIndex && c === colIndex ? updater(cell) : cell,
      ),
    );
    emitChange({ ...tableData, data: nextRows });
  };

  const handleAddRow = () => {
    const newRow: TableCell[] = Array.from(
      { length: columnCount || 1 },
      () => ({
        content: "",
      }),
    );
    emitChange({ ...tableData, data: [...tableData.data, newRow] });
  };

  const handleAddColumn = () => {
    const nextRows = tableData.data.map((row) => [...row, { content: "" }]);
    emitChange({ ...tableData, data: nextRows });
  };

  const isHeaderRow = (index: number) =>
    tableType !== "blank" &&
    (tableType === "vertical" || tableType === "matrix") &&
    index === 0;

  const isHeaderColumn = (index: number) =>
    tableType !== "blank" &&
    (tableType === "horizontal" || tableType === "matrix") &&
    index === 0;

  const canDeleteRow = (index: number) => !isHeaderRow(index) && rowCount > 1;
  const canDeleteColumn = (index: number) =>
    !isHeaderColumn(index) && columnCount > 1;

  const handleRemoveRow = (index: number) => {
    if (!canDeleteRow(index)) return;
    emitChange({
      ...tableData,
      data: tableData.data.filter((_, i) => i !== index),
    });
  };

  const handleRemoveColumn = (index: number) => {
    if (!canDeleteColumn(index)) return;
    const nextRows = tableData.data.map((row) =>
      row.length > 1
        ? row.filter((_, colIndex) => colIndex !== index)
        : [{ content: "" }],
    );
    emitChange({ ...tableData, data: nextRows });
  };

  const renderCellClass = (
    rowIndex: number,
    cellIndex: number,
    isHeader: boolean,
  ) => {
    const isMatrixCorner =
      tableType === "matrix" && rowIndex === 0 && cellIndex === 0;
    const baseCellClass = `px-2 py-1 align-top`;

    const cellStyle = isMatrixCorner
      ? styles.table.cornerCell
      : isHeader
        ? styles.table.headers
        : styles.table.rows;

    return `${baseCellClass} ${cellStyle}`;
  };

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <table
          className="rounded-lg"
          style={{
            borderCollapse: "separate",
            borderSpacing: 0,
          }}
        >
          <colgroup>
            <col style={{ width: "40px" }} />
            {Array.from({ length: columnCount }, () => (
              <col key={Math.random()} />
            ))}
            <col style={{ width: "40px" }} />
          </colgroup>
          <thead>
            <tr>
              <th className="p-0 bg-transparent" />
              {Array.from({ length: columnCount }, (_, colIndex) => (
                <th
                  key={`col-control-${colIndex}`}
                  className="text-center align-middle p-1 bg-transparent"
                >
                  <button
                    type="button"
                    className={`w-7 h-7 inline-flex items-center justify-center rounded-full border text-xs shadow-sm bg-slate-900/80 text-white ${
                      canDeleteColumn(colIndex)
                        ? "hover:bg-slate-800/90"
                        : "opacity-40 cursor-not-allowed"
                    }`}
                    onClick={() => handleRemoveColumn(colIndex)}
                    disabled={!canDeleteColumn(colIndex)}
                    aria-label={`Delete column ${colIndex + 1}`}
                    title={
                      canDeleteColumn(colIndex)
                        ? "Delete column"
                        : "Cannot delete header column"
                    }
                  >
                    -
                  </button>
                </th>
              ))}
              <th className="text-center align-middle p-1 bg-transparent">
                <button
                  type="button"
                  className="w-8 h-8 inline-flex items-center justify-center rounded-full border text-xs shadow-sm bg-indigo-600 text-white hover:bg-indigo-500"
                  onClick={handleAddColumn}
                  aria-label="Add column"
                  title="Add column"
                >
                  +
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {tableData.data.map((row, rowIndex) => (
              <tr key={`row-${rowIndex}`}>
                <td className="text-center align-middle p-1 bg-transparent">
                  <button
                    type="button"
                    className={`w-7 h-7 inline-flex items-center justify-center rounded-full border text-xs shadow-sm bg-slate-900/80 text-white ${
                      canDeleteRow(rowIndex)
                        ? "hover:bg-slate-800/90"
                        : "opacity-40 cursor-not-allowed"
                    }`}
                    onClick={() => handleRemoveRow(rowIndex)}
                    disabled={!canDeleteRow(rowIndex)}
                    aria-label={`Delete row ${rowIndex + 1}`}
                    title={
                      canDeleteRow(rowIndex)
                        ? "Delete row"
                        : "Cannot delete header row"
                    }
                  >
                    -
                  </button>
                </td>
                {row.map((cell, cellIndex) => {
                  const isHeader =
                    (tableType === "vertical" && rowIndex === 0) ||
                    (tableType === "horizontal" && cellIndex === 0) ||
                    (tableType === "matrix" &&
                      (rowIndex === 0 || cellIndex === 0));
                  const CellComponent = (isHeader ? "th" : "td") as "th" | "td";
                  const scope =
                    cell.scope ??
                    (tableType === "horizontal" && cellIndex === 0
                      ? "row"
                      : tableType === "vertical" && rowIndex === 0
                        ? "col"
                        : tableType === "matrix"
                          ? rowIndex === 0 && cellIndex === 0
                            ? undefined
                            : rowIndex === 0
                              ? "col"
                              : cellIndex === 0
                                ? "row"
                                : undefined
                          : undefined);

                  // Apply borders to create the table structure
                  const borderClasses = `border-r border-b ${styles.table.border} ${
                    cellIndex === 0 ? `border-l ${styles.table.border}` : ""
                  } ${rowIndex === 0 ? `border-t ${styles.table.border}` : ""}`;

                  return (
                    <CellComponent
                      key={`cell-${rowIndex}-${cellIndex}`}
                      className={`${renderCellClass(rowIndex, cellIndex, isHeader)} ${borderClasses}`}
                      scope={scope}
                    >
                      <EditableTableCell
                        value={cell.content ?? ""}
                        onChange={(next) =>
                          updateCell(rowIndex, cellIndex, (prev) => ({
                            ...prev,
                            content: next,
                          }))
                        }
                      />
                    </CellComponent>
                  );
                })}
                <td className="p-0 bg-transparent" />
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td className="text-center align-middle p-1 bg-transparent">
                <button
                  type="button"
                  className="w-8 h-8 inline-flex items-center justify-center rounded-full border text-xs shadow-sm bg-indigo-600 text-white hover:bg-indigo-500"
                  onClick={handleAddRow}
                  aria-label="Add row"
                  title="Add row"
                >
                  +
                </button>
              </td>
              <td className="p-0 bg-transparent" colSpan={columnCount + 1} />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
