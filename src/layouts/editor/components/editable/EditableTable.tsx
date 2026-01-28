import type {
  StyleTheme,
  TableCell,
  TableData,
} from "@shadow-shard-tools/docs-core";
import { Minus, Plus } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import Button from "../../../common/components/Button";
import EditableRichText from "./EditableRichText";
import {
  addColumn,
  addRow,
  getCellScope,
  getTableDimensions,
  isHeaderCell,
  isHeaderColumn,
  isHeaderRow,
  normalizeTableData,
  removeColumn,
  removeRow,
  toPlainText,
} from "./tableUtils";

interface EditableTableProps {
  data?: TableData;
  styles: StyleTheme;
  onChange: (next: TableData) => void;
}

function EditableTableCell({
  value,
  onChange,
  styles,
}: {
  value: string;
  onChange: (next: string) => void;
  styles: StyleTheme;
}) {
  return (
    <EditableRichText
      value={value}
      styles={styles}
      className="min-w-[6rem] bg-transparent outline-none px-1 py-0.5 rounded focus:ring-1 focus:ring-sky-400"
      onChange={onChange}
    />
  );
}

function EditablePlainTableCell({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const nextValue = toPlainText(value ?? "");
    if (ref.current.innerText !== nextValue) {
      ref.current.innerText = nextValue;
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
  const tableRef = useRef<HTMLTableElement>(null);
  const pendingScrollRef = useRef<"row" | "column" | null>(null);
  const tableData = useMemo(() => normalizeTableData(data), [data]);
  const tableType = tableData.type ?? "horizontal";
  const { columnCount, rowCount } = useMemo(
    () => getTableDimensions(tableData),
    [tableData],
  );

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
    pendingScrollRef.current = "row";
    emitChange(addRow(tableData, columnCount));
  };

  const handleAddColumn = () => {
    pendingScrollRef.current = "column";
    emitChange(addColumn(tableData));
  };

  const canDeleteRow = (index: number) =>
    !isHeaderRow(tableType, index) && rowCount > 1;
  const canDeleteColumn = (index: number) =>
    !isHeaderColumn(tableType, index) && columnCount > 1;

  const handleRemoveRow = (index: number) => {
    if (!canDeleteRow(index)) return;
    emitChange(removeRow(tableData, index));
  };

  const handleRemoveColumn = (index: number) => {
    if (!canDeleteColumn(index)) return;
    emitChange(removeColumn(tableData, index));
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

  useEffect(() => {
    const pending = pendingScrollRef.current;
    if (!pending) return;
    pendingScrollRef.current = null;

    const table = tableRef.current;
    if (!table) return;

    requestAnimationFrame(() => {
      if (pending === "row") {
        const lastRow = table.querySelector("tbody tr:last-child");
        lastRow?.scrollIntoView({ block: "nearest", behavior: "smooth" });
        return;
      }

      const headerCells = table.querySelectorAll("thead th[data-col-control]");
      const lastHeader = headerCells[headerCells.length - 1];
      lastHeader?.scrollIntoView({
        inline: "nearest",
        block: "nearest",
        behavior: "smooth",
      });
    });
  }, [rowCount, columnCount]);

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <table
          ref={tableRef}
          className="rounded-lg"
          style={{
            borderCollapse: "separate",
            borderSpacing: 0,
          }}
        >
          <colgroup>
            <col style={{ width: "40px" }} />
            {Array.from({ length: columnCount }, (_, colIndex) => (
              <col key={`col-${colIndex}`} />
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
                  data-col-control
                >
                  <Button
                    type="button"
                    className={`w-7 h-7 inline-flex items-center justify-center text-xs ${
                      canDeleteColumn(colIndex)
                        ? ""
                        : "opacity-40 cursor-not-allowed"
                    }`}
                    styles={styles}
                    onClick={() => handleRemoveColumn(colIndex)}
                    disabled={!canDeleteColumn(colIndex)}
                    aria-label={`Delete column ${colIndex + 1}`}
                    title={
                      canDeleteColumn(colIndex)
                        ? "Delete column"
                        : "Cannot delete header column"
                    }
                  >
                    <Minus className="w-4 h-4" aria-hidden="true" />
                  </Button>
                </th>
              ))}
              <th className="text-center align-middle p-1 bg-transparent">
                <Button
                  type="button"
                  className="w-8 h-8 inline-flex items-center justify-center text-xs"
                  styles={styles}
                  onClick={handleAddColumn}
                  aria-label="Add column"
                  title="Add column"
                >
                  <Plus className="w-4 h-4" aria-hidden="true" />
                </Button>
              </th>
            </tr>
          </thead>
          <tbody>
            {tableData.data.map((row, rowIndex) => (
              <tr key={`row-${rowIndex}`}>
                <td className="text-center align-middle p-1 bg-transparent">
                  <Button
                    type="button"
                    className={`w-7 h-7 inline-flex items-center justify-center text-xs ${
                      canDeleteRow(rowIndex)
                        ? ""
                        : "opacity-40 cursor-not-allowed"
                    }`}
                    styles={styles}
                    onClick={() => handleRemoveRow(rowIndex)}
                    disabled={!canDeleteRow(rowIndex)}
                    aria-label={`Delete row ${rowIndex + 1}`}
                    title={
                      canDeleteRow(rowIndex)
                        ? "Delete row"
                        : "Cannot delete header row"
                    }
                  >
                    <Minus className="w-4 h-4" aria-hidden="true" />
                  </Button>
                </td>
                {row.map((cell, cellIndex) => {
                  const isHeader = isHeaderCell(tableType, rowIndex, cellIndex);
                  const allowRichText = !isHeader;
                  const CellComponent = (isHeader ? "th" : "td") as "th" | "td";
                  const scope = getCellScope(
                    tableType,
                    rowIndex,
                    cellIndex,
                    cell.scope,
                  );

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
                      {allowRichText ? (
                        <EditableTableCell
                          value={cell.content ?? ""}
                          styles={styles}
                          onChange={(next) =>
                            updateCell(rowIndex, cellIndex, (prev) => ({
                              ...prev,
                              content: next,
                            }))
                          }
                        />
                      ) : (
                        <EditablePlainTableCell
                          value={cell.content ?? ""}
                          onChange={(next) =>
                            updateCell(rowIndex, cellIndex, (prev) => ({
                              ...prev,
                              content: toPlainText(next),
                            }))
                          }
                        />
                      )}
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
                <Button
                  type="button"
                  className="w-8 h-8 inline-flex items-center justify-center text-xs"
                  styles={styles}
                  onClick={handleAddRow}
                  aria-label="Add row"
                  title="Add row"
                >
                  <Plus className="w-4 h-4" aria-hidden="true" />
                </Button>
              </td>
              <td className="p-0 bg-transparent" colSpan={columnCount + 1} />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
