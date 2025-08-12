import { Config } from "../../../configs/pdf-config";
import type { TableData } from "../../../layouts/blocks/types";
import type { TableCell } from "../../../layouts/blocks/types/TableData";
import type { RenderContext } from "../types/RenderContext";

export async function addTable(ctx: RenderContext, table: TableData) {
  const rows = table?.data ?? [];
  if (!rows.length || !rows[0]?.length) return;

  const type = table.type ?? "vertical"; // default to first-row headers like HTML tables

  // Layout / style
  const margin = ctx.canvas.margin;
  const pageW = ctx.canvas.pageWidth;
  const contentW = pageW - 2 * margin;

  const size = Config.FONT_SIZES.table;
  const lineGap = 2;
  const padX = 8;
  const padY = 6;
  const minRowH = Math.max(22, size + padY * 2);

  const strokeColor = Config.COLORS.border;
  const headerFill = Config.COLORS.tableHeader;
  const cornerFill = Config.COLORS.tableCorner;
  const headerTextColor = Config.COLORS.tableHeaderText;

  const cols = rows[0].length;
  const colW = contentW / cols;

  const fontRow = ctx.fonts.regular;
  const fontHeader = ctx.fonts.bold;

  const widthOf = (text: string, isHeader: boolean) =>
    ctx.canvas.widthOf(text, isHeader ? fontHeader : fontRow, size);

  const isMatrixCorner = (r: number, c: number) => type === "matrix" && r === 0 && c === 0;

  const isHeaderCell = (r: number, c: number, cell: TableCell) => {
    if (cell?.isHeader) return true;
    if (type === "matrix") return r === 0 || c === 0;
    if (type === "vertical") return r === 0;
    if (type === "horizontal") return c === 0;
    return false;
  };

  // Quick line-wrap measure to estimate row height
  const measureCellHeight = (text: string, asHeader: boolean) => {
    const maxW = colW - padX * 2;
    if (maxW <= 0) return minRowH;

    const words = (text ?? "").split(/\s+/);
    let lines = 1;
    let lineW = 0;

    for (const word of words) {
      const token = (lineW ? " " : "") + word;
      const w = widthOf(token, asHeader);
      if (lineW + w > maxW) {
        lines += 1;
        lineW = widthOf(word, asHeader);
      } else {
        lineW += w;
      }
    }

    const lineH = size + lineGap;
    return Math.max(minRowH, padY * 2 + lines * lineH);
  };

  const rowHeights = rows.map((row, r) => {
    let h = minRowH;
    for (let c = 0; c < cols; c++) {
      const cell = row[c];
      const asHeader = isHeaderCell(r, c, cell);
      h = Math.max(h, measureCellHeight(cell?.content ?? "", asHeader));
    }
    return h;
  });

  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    const rowH = rowHeights[r];

    ctx.canvas.ensureSpace(rowH);
    const rowTop = ctx.canvas.getY();

    for (let c = 0; c < cols; c++) {
      const cell = row[c];
      const x = margin + c * colW;

      const header = isHeaderCell(r, c, cell);
      const corner = isMatrixCorner(r, c);

      const bg =
        (corner && cornerFill) ||
        (header && headerFill);

      if (bg) {
        ctx.canvas.drawRect({
          x,
          y: rowTop,
          width: colW,
          height: rowH,
          fill: bg,
          advanceCursor: false,
        });
      }

      // Border
      ctx.canvas.drawRect({
        x,
        y: rowTop,
        width: colW,
        height: rowH,
        stroke: strokeColor,
        lineWidth: 0.5,
        advanceCursor: false,
      });

      // Text
      ctx.canvas.drawTextBlock({
        text: cell?.content ?? "",
        x: x + padX,
        y: rowTop + padY,
        width: colW - padX * 2,
        font: header ? fontHeader : fontRow,
        size,
        color: header ? headerTextColor : Config.COLORS.text,
        lineGap,
        align: "left",
        advanceCursor: false,
      });
    }

    ctx.canvas.setY(rowTop + rowH);
  }

  ctx.canvas.setY(ctx.canvas.getY() + Config.SPACING.tableBottom);
}
