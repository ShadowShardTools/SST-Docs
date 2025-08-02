import React from "react";
import type { StyleTheme } from "../../../../types/StyleTheme";
import type { TableData } from "../../types";

interface TableBlockProps {
  index: number;
  styles: StyleTheme;
  tableData: TableData;
}

const TableBlock: React.FC<TableBlockProps> = ({
  tableData,
  styles,
  index,
}) => {
  if (!tableData.data?.length) {
    return (
      <div key={index} className={`mb-6 p-4 ${styles.table.empty}`}>
        No data available
      </div>
    );
  }

  return (
    <div
      key={index}
      className="mb-6 overflow-x-auto"
      style={{
        WebkitOverflowScrolling: "touch",
        overflowX: "auto",
        whiteSpace: "nowrap",
      }}
    >
      <table
        className={`${styles.table.border} border rounded-lg`}
        style={{
          borderCollapse: "collapse",
          tableLayout: "auto",
          minWidth: "100%",
        }}
      >
        <tbody>
          {tableData.data.map((row, rowIndex) => (
            <tr
              key={`row-${rowIndex}`}
              className={`border-b ${styles.table.border} last:border-b-0 ${styles.table.rows}`}
            >
              {row.map((cell, cellIndex) => {
                const CellComponent = cell.isHeader ? "th" : "td";
                const isMatrixCorner =
                  tableData.type === "matrix" &&
                  rowIndex === 0 &&
                  cellIndex === 0;
                const baseCellClass = `px-2 py-1 border-r ${styles.table.border} last:border-r-0`;

                const cellStyle = isMatrixCorner
                  ? styles.table.cornerCell
                  : cell.isHeader ||
                      (tableData.type === "vertical" && rowIndex === 0) ||
                      (tableData.type === "horizontal" && cellIndex === 0)
                    ? styles.table.headers
                    : styles.table.rows;

                return (
                  <CellComponent
                    key={`cell-${rowIndex}-${cellIndex}`}
                    className={`${baseCellClass} ${cellStyle}`}
                    scope={cell.scope}
                  >
                    {cell.content}
                  </CellComponent>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableBlock;
