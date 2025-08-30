import { Config } from "../../../configs/pdf-config";
import type { TableData } from "../../../layouts/blocks/types";
import type { TableCell } from "../../../layouts/blocks/types/TableData";
import type { RenderContext } from "../types/RenderContext";

export async function addTable(ctx: RenderContext, table: TableData) {
  const rows = table?.data ?? [];
  if (!rows.length || !rows[0]?.length) return;

  const type = table.type ?? "vertical"; // default like HTML: first row = header

  // Layout / style from PdfCanvas content box
  const xL = ctx.canvas.contentLeft;
  const contentW = ctx.canvas.contentWidth;

  const size = Config.FONT_SIZES.table;
  const lineGapPx = 2;
  const lineHeight = 1 + lineGapPx / size; // ~ old lineGap=2
  const padX = 8;
  const padY = 6;
  const minRowH = Math.max(22, size + padY * 2);

  const strokeColor = Config.COLORS.border;
  const headerFill = Config.COLORS.tableHeader;
  const cornerFill = Config.COLORS.tableCorner;
  const headerTextColor = Config.COLORS.tableHeaderText;
  const bodyTextColor = Config.COLORS.text;

  const cols = rows[0].length;
  const colW = contentW / cols;

  const fontRow = ctx.fonts.regular;
  const fontHeader = ctx.fonts.bold;

  const isMatrixCorner = (r: number, c: number) =>
    type === "matrix" && r === 0 && c === 0;

  const isHeaderCell = (r: number, c: number, cell: TableCell | undefined) => {
    if (cell?.isHeader) return true;
    if (type === "matrix") return r === 0 || c === 0;
    if (type === "vertical") return r === 0;
    if (type === "horizontal") return c === 0;
    return false;
  };

  // Measure row heights once (no wrapping surprises later)
  const rowHeights = rows.map((row, r) => {
    let h = minRowH;
    for (let c = 0; c < cols; c++) {
      const cell = row[c];
      const asHeader = isHeaderCell(r, c, cell);
      const font = asHeader ? fontHeader : fontRow;
      const maxWidth = Math.max(0, colW - padX * 2);
      const { totalHeight } = ctx.canvas.measureAndWrap(cell?.content ?? "", {
        font,
        size,
        maxWidth,
        lineHeight,
      });
      h = Math.max(h, padY * 2 + totalHeight);
    }
    return h;
  });

  // Draw a thin horizontal rule at absolute y without consuming space
  function drawH(yTopDown: number, thickness = 0.5) {
    const before = ctx.canvas.cursorY;
    ctx.canvas.withRegion(
      { x: xL, y: yTopDown, width: contentW, height: thickness + 1 },
      () => {
        ctx.canvas.cursorY = yTopDown;
        ctx.canvas.drawRule({
          thickness,
          color: strokeColor,
          width: contentW,
          align: "left",
          spacingBefore: 0,
          spacingAfter: 0,
        });
      },
    );
    ctx.canvas.cursorY = before;
  }

  // Draw a thin vertical separator for a single row using a filled skinny box
  function drawV(x: number, y: number, h: number, thickness = 0.5) {
    const before = ctx.canvas.cursorY;
    ctx.canvas.withRegion({ x, y, width: thickness, height: h }, () => {
      ctx.canvas.cursorY = y;
      ctx.canvas.drawBox(thickness, h, {
        fill: strokeColor,
        padding: 0,
        strokeWidth: 0,
      });
    });
    ctx.canvas.cursorY = before;
  }

  // Render rows
  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    const rowH = rowHeights[r];

    // Keep whole row on the current page
    ctx.canvas.ensureSpace({ minHeight: rowH });
    const rowTop = ctx.canvas.cursorY;

    // --- Background fills first (no borders here) ---
    for (let c = 0; c < cols; c++) {
      const cell = row[c];
      const x = xL + c * colW;

      const header = isHeaderCell(r, c, cell);
      const corner = isMatrixCorner(r, c);
      const fill =
        (corner && cornerFill) || (header && headerFill) || undefined;

      if (fill) {
        const before = ctx.canvas.cursorY;
        ctx.canvas.withRegion(
          { x, y: rowTop, width: colW, height: rowH },
          () => {
            ctx.canvas.cursorY = rowTop;
            ctx.canvas.drawBox(colW, rowH, {
              fill,
              padding: 0,
              strokeWidth: 0, // no per-cell borders
            });
          },
        );
        ctx.canvas.cursorY = before;
      }
    }

    // --- Text on top of fills ---
    for (let c = 0; c < cols; c++) {
      const cell = row[c];
      const x = xL + c * colW;
      const header = isHeaderCell(r, c, cell);

      const font = header ? fontHeader : fontRow;
      const textColor = header ? headerTextColor : bodyTextColor;

      const inner = {
        x: x + padX,
        y: rowTop + padY,
        width: Math.max(0, colW - padX * 2),
        height: Math.max(0, rowH - padY * 2),
      };

      ctx.canvas.withRegion(inner, () => {
        ctx.canvas.cursorY = inner.y;
        ctx.canvas.drawText(cell?.content ?? "", {
          font,
          size,
          color: textColor,
          align: "left",
          maxWidth: inner.width,
          spacingBefore: 0,
          spacingAfter: 0,
          lineHeight,
        });
      });
    }

    // --- Grid lines for this row (single stroke per boundary) ---
    // horizontal top for the row (or will redraw same line each row; harmless)
    drawH(rowTop, 0.5);

    // vertical separators for each col boundary in this row
    for (let c = 0; c <= cols; c++) {
      const vx = xL + c * colW;
      drawV(vx, rowTop, rowH, 0.5);
    }

    // advance baseline to next row
    ctx.canvas.cursorY = rowTop + rowH;

    // bottom border for the last row only
    if (r === rows.length - 1) {
      drawH(ctx.canvas.cursorY, 0.5);
    }
  }

  // spacing after table
  ctx.canvas.moveY(Config.SPACING.tableBottom);
}
