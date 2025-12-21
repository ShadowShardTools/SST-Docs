// src/generators/pdf-generator/blocks/addImageGrid.ts
import type { RenderContext } from "../../types/RenderContext";
import { Config } from "../../pdf-config";

import {
  clampScale,
  resolveImagePath,
  embedImageFromFile,
  getImageBoxPosition,
  measureCaptionHeight,
  drawCenteredCaption,
  handleImageError,
} from "../utilities";
import type { ImageGridData } from "@shadow-shard-tools/docs-core";

interface GridCell {
  image: any; // PDF embedded image
  caption: string;
  originalWidth: number;
  originalHeight: number;
}

interface GridLayout {
  columns: number;
  rows: number;
  cellWidth: number;
  cellHeight: number;
  gridWidth: number;
  gridHeight: number;
  gap: number;
}

export async function addImageGrid(
  ctx: RenderContext,
  data: ImageGridData,
): Promise<void> {
  if (!data.images?.length) return;

  const alignment: "left" | "center" | "right" =
    (data.alignment as any) ?? "center";
  const scale = clampScale(data.scale);

  const spacingTop = Config.SPACING?.medium ?? 12;
  const spacingBottom = Config.SPACING?.medium ?? 12;
  const gap = Config.SPACING?.small ?? 8;

  try {
    // Load all images in parallel
    const cells = await loadGridImages(ctx, data.images);
    if (!cells.length) {
      handleImageError(
        ctx,
        `[Image grid could not be rendered: no valid images]`,
        spacingTop,
        spacingBottom,
      );
      return;
    }

    // Calculate optimal grid layout
    const layout = calculateGridLayout(
      cells,
      ctx.canvas.contentWidth,
      scale,
      gap,
    );

    // Calculate positioning
    const contentLeft = ctx.canvas.contentLeft;
    const contentWidth = ctx.canvas.contentWidth;
    const boxX = getImageBoxPosition(
      contentLeft,
      contentWidth,
      layout.gridWidth,
      alignment,
    );

    // Caption settings
    const capSize = Config.FONT_SIZES.alternative ?? 10;
    const capColor = Config.COLORS.alternativeText ?? Config.COLORS.text;
    const capGap = 4;

    // Calculate total height with proper caption spacing
    const totalHeight = calculateTotalGridHeight(
      ctx,
      cells,
      layout,
      capSize,
      capGap,
      spacingTop,
      spacingBottom,
    );

    // Ensure space and render
    ctx.canvas.ensureBlock({ minHeight: totalHeight, keepTogether: true });
    ctx.canvas.moveY(spacingTop);

    await renderGrid(ctx, cells, layout, boxX, capSize, capColor, capGap);

    ctx.canvas.moveY(spacingBottom);
  } catch (err) {
    handleImageError(
      ctx,
      `[Image grid could not be rendered]`,
      spacingTop,
      spacingBottom,
    );
    console.error("addImageGrid error:", err);
  }
}

function calculateTotalGridHeight(
  ctx: RenderContext,
  cells: GridCell[],
  layout: GridLayout,
  capSize: number,
  capGap: number,
  spacingTop: number,
  spacingBottom: number,
): number {
  // Calculate caption heights for each row
  let totalHeight = spacingTop + spacingBottom;

  for (let row = 0; row < layout.rows; row++) {
    // Add image height for this row
    totalHeight += layout.cellHeight;

    // Check if any images in this row have captions
    let maxCaptionHeightInRow = 0;
    for (let col = 0; col < layout.columns; col++) {
      const cellIndex = row * layout.columns + col;
      if (cellIndex < cells.length && cells[cellIndex].caption) {
        const captionHeight = measureCaptionHeight(
          ctx,
          cells[cellIndex].caption,
          capSize,
          layout.cellWidth,
        );
        maxCaptionHeightInRow = Math.max(maxCaptionHeightInRow, captionHeight);
      }
    }

    // Add caption space if any cell in this row has a caption
    if (maxCaptionHeightInRow > 0) {
      totalHeight += capGap + maxCaptionHeightInRow;
    }

    // Add gap between rows (except for the last row)
    if (row < layout.rows - 1) {
      totalHeight += layout.gap;
    }
  }

  return totalHeight;
}

async function loadGridImages(
  ctx: RenderContext,
  images: Array<{ src?: string; alt?: string }>,
): Promise<GridCell[]> {
  const cells: GridCell[] = [];

  for (const img of images) {
    if (!img?.src) continue;

    try {
      const absPath = resolveImagePath(img.src, ctx.fsDataPath);
      const pdfImg = await embedImageFromFile(ctx, absPath);

      cells.push({
        image: pdfImg,
        caption: (img.alt ?? "").trim(),
        originalWidth: pdfImg.width,
        originalHeight: pdfImg.height,
      });
    } catch (error) {
      console.warn(`Failed to load grid image ${img.src}:`, error);
      // Continue with other images instead of failing completely
    }
  }

  return cells;
}

function calculateGridLayout(
  cells: GridCell[],
  contentWidth: number,
  scale: number,
  gap: number,
): GridLayout {
  const imageCount = cells.length;

  // Determine optimal column count (similar to CSS grid behavior)
  let columns: number;
  if (imageCount === 1) {
    columns = 1;
  } else if (imageCount === 2) {
    columns = 2;
  } else if (imageCount <= 6) {
    columns = 3;
  } else if (imageCount <= 12) {
    columns = 4;
  } else {
    columns = Math.min(5, Math.ceil(Math.sqrt(imageCount)));
  }

  const rows = Math.ceil(imageCount / columns);

  // Calculate cell dimensions
  const availableWidth = Math.max(100, Math.round(contentWidth * scale));
  const totalGapWidth = (columns - 1) * gap;
  const cellWidth = Math.floor((availableWidth - totalGapWidth) / columns);

  // Calculate max image height based on aspect ratios
  let maxImageHeight = 0;
  for (const cell of cells) {
    const aspect = cell.originalHeight / cell.originalWidth;
    const imageHeight = cellWidth * aspect;
    maxImageHeight = Math.max(maxImageHeight, imageHeight);
  }

  // Limit image height to reasonable bounds
  const imageHeight = Math.min(maxImageHeight, cellWidth * 1.5);

  // Cell height includes image height only - captions are handled separately
  const cellHeight = imageHeight;

  const gridWidth = cellWidth * columns + totalGapWidth;
  const gridHeight = cellHeight * rows + (rows - 1) * gap;

  return {
    columns,
    rows,
    cellWidth,
    cellHeight,
    gridWidth,
    gridHeight,
    gap,
  };
}

async function renderGrid(
  ctx: RenderContext,
  cells: GridCell[],
  layout: GridLayout,
  gridStartX: number,
  capSize: number,
  capColor: any,
  capGap: number,
): Promise<void> {
  const startY = ctx.canvas.cursorY;
  let currentRowY = startY;

  // Process row by row to handle caption spacing properly
  for (let row = 0; row < layout.rows; row++) {
    // Calculate caption heights for current row
    let maxCaptionHeightInRow = 0;
    const rowCells: Array<{ cell: GridCell; index: number }> = [];

    for (let col = 0; col < layout.columns; col++) {
      const cellIndex = row * layout.columns + col;
      if (cellIndex < cells.length) {
        const cell = cells[cellIndex];
        rowCells.push({ cell, index: cellIndex });

        if (cell.caption) {
          const captionHeight = measureCaptionHeight(
            ctx,
            cell.caption,
            capSize,
            layout.cellWidth,
          );
          maxCaptionHeightInRow = Math.max(
            maxCaptionHeightInRow,
            captionHeight,
          );
        }
      }
    }

    // Render images in current row
    for (const { cell, index } of rowCells) {
      const col = index % layout.columns;

      // Calculate cell position
      const cellX = gridStartX + col * (layout.cellWidth + layout.gap);
      const cellY = currentRowY;

      // Calculate image dimensions (maintain aspect ratio, fit within cell)
      const aspect = cell.originalHeight / cell.originalWidth;
      let imgWidth = layout.cellWidth;
      let imgHeight = layout.cellWidth * aspect;

      // If image is too tall, scale down to fit cell height
      if (imgHeight > layout.cellHeight) {
        imgHeight = layout.cellHeight;
        imgWidth = layout.cellHeight / aspect;
      }

      // Center image within cell
      const imgX = cellX + (layout.cellWidth - imgWidth) / 2;
      const imgY = cellY;

      // Draw image using region to contain it
      ctx.canvas.withRegion(
        {
          x: cellX,
          y: cellY,
          width: layout.cellWidth,
          height: layout.cellHeight,
        },
        () => {
          ctx.canvas.cursorY = imgY;
          ctx.canvas.drawImage(cell.image, {
            x: imgX,
            width: imgWidth,
            height: imgHeight,
          });
        },
      );

      // Draw caption if present
      if (cell.caption) {
        const captionY = cellY + layout.cellHeight + capGap;
        ctx.canvas.withRegion(
          {
            x: cellX,
            y: captionY,
            width: layout.cellWidth,
            height: maxCaptionHeightInRow, // Use row's max caption height
          },
          () => {
            ctx.canvas.cursorY = captionY;
            drawCenteredCaption({
              ctx,
              text: cell.caption,
              boxX: cellX,
              boxW: layout.cellWidth,
              size: capSize,
              color: capColor,
            });
          },
        );
      }
    }

    // Move to next row position
    currentRowY += layout.cellHeight;
    if (maxCaptionHeightInRow > 0) {
      currentRowY += capGap + maxCaptionHeightInRow;
    }
    if (row < layout.rows - 1) {
      // Add gap between rows except for last row
      currentRowY += layout.gap;
    }
  }

  // Move cursor to end of entire grid
  ctx.canvas.cursorY = currentRowY;
}
