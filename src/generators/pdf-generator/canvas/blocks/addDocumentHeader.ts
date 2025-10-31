import { Config } from "../../../../configs/pdf-config";
import type { RenderContext } from "../../types/RenderContext";

const PADDING_X = 24;
const PADDING_Y = 16;
const ICON_SIZE = 22;
const ICON_GAP = 6;
const BREADCRUMB_GAP = 6;

export interface DocumentHeaderData {
  title: string;
  breadcrumb?: string;
  isSelectedCategory?: boolean;
}

function measureLinesWidth(
  lines: string[],
  font: RenderContext["fonts"]["regular"],
  size: number,
) {
  let width = 0;
  for (const line of lines)
    width = Math.max(width, font.widthOfTextAtSize(line, size));
  return width;
}

export async function addDocumentHeader(
  ctx: RenderContext,
  data: DocumentHeaderData,
) {
  if (!data?.title) return;

  const pageWidth = ctx.canvas.pageWidth;
  const marginLeft = ctx.canvas.contentLeft;
  const marginRight = pageWidth - ctx.canvas.contentRight;
  const innerWidth = Math.max(1, pageWidth - marginLeft - marginRight);

  const spacingTop = Config.SPACING.medium;
  const spacingBottom = Config.SPACING.medium;

  const breadcrumb = (data.breadcrumb ?? "").trim();
  const iconKey = (
    data.isSelectedCategory ? "category" : "document"
  ) as keyof RenderContext["icons"];
  const icon =
    ctx.icons?.[iconKey] ?? ctx.icons?.document ?? ctx.icons?.neutral;

  const titleFont = ctx.fonts.bold;
  const titleSize = Config.FONT_SIZES.category;
  const lineHeight = Config.LINE_HEIGHT_SCALE ?? 1.2;

  const iconWidth = icon ? ICON_SIZE : 0;
  const iconGap = icon ? ICON_GAP : 0;

  const textMaxWidth = Math.max(
    1,
    innerWidth - PADDING_X * 2 - iconWidth - iconGap,
  );

  const titleMetrics = ctx.canvas.measureAndWrap(data.title, {
    font: titleFont,
    size: titleSize,
    maxWidth: textMaxWidth,
    lineHeight,
  });

  const titleHeight = Math.max(
    titleMetrics.totalHeight,
    iconWidth ? ICON_SIZE : titleMetrics.totalHeight,
  );
  const rawTitleWidth = measureLinesWidth(
    titleMetrics.lines,
    titleFont,
    titleSize,
  );
  const titleContentWidth = Math.max(1, Math.min(rawTitleWidth, textMaxWidth));

  const breadcrumbSize = Math.max(10, Config.FONT_SIZES.alternative ?? 10);
  const breadcrumbMetrics = breadcrumb
    ? ctx.canvas.measureAndWrap(breadcrumb, {
        font: ctx.fonts.regular,
        size: breadcrumbSize,
        maxWidth: Math.max(1, innerWidth - PADDING_X * 2),
        lineHeight,
      })
    : null;
  const breadcrumbHeight = breadcrumbMetrics?.totalHeight ?? 0;

  const blockHeight =
    PADDING_Y * 2 +
    titleHeight +
    (breadcrumb ? BREADCRUMB_GAP + breadcrumbHeight : 0);

  const startCursor = ctx.canvas.cursorY;
  const atPageStart = Math.abs(startCursor - ctx.canvas.top) < 0.5;

  const requiredHeight =
    blockHeight + spacingBottom + (atPageStart ? 0 : spacingTop);
  ctx.canvas.ensureBlock({ minHeight: requiredHeight, keepTogether: true });

  if (!atPageStart) {
    ctx.canvas.moveY(spacingTop);
  }

  const textBaseline = ctx.canvas.cursorY;
  const backgroundTop = atPageStart ? 0 : textBaseline;
  const innerRegionTop = atPageStart ? 0 : textBaseline;

  ctx.canvas.withRegion(
    { x: 0, y: backgroundTop, width: pageWidth, height: blockHeight },
    () => {
      const before = ctx.canvas.cursorY;
      ctx.canvas.cursorY = backgroundTop;
      ctx.canvas.drawBox(pageWidth, blockHeight, {
        fill: Config.COLORS.documentHeaderBackground,
        stroke: Config.COLORS.documentHeaderBorder,
        strokeWidth: 1.5,
        padding: 0,
      });
      ctx.canvas.cursorY = before;
    },
  );

  ctx.canvas.withRegion(
    {
      x: marginLeft,
      y: innerRegionTop,
      width: innerWidth,
      height: blockHeight,
    },
    () => {
      const rowTop = innerRegionTop + PADDING_Y;
      const contentRegionLeft = marginLeft + PADDING_X;
      const contentRegionWidth = innerWidth - PADDING_X * 2;

      const contentWidth = iconWidth + iconGap + titleContentWidth;
      const groupStart =
        contentRegionLeft +
        Math.max(0, (contentRegionWidth - contentWidth) / 2);

      const iconX = groupStart;
      const textStartX = iconX + iconWidth + iconGap;

      if (icon) {
        const iconY = rowTop + (titleHeight - ICON_SIZE) / 2;
        ctx.canvas.drawImage(icon, {
          x: iconX,
          y: iconY,
          width: ICON_SIZE,
          height: ICON_SIZE,
        });
      }

      ctx.canvas.withRegion(
        { x: textStartX, y: rowTop, width: textMaxWidth, height: titleHeight },
        () => {
          ctx.canvas.cursorY = rowTop;
          ctx.canvas.drawText(data.title, {
            font: titleFont,
            size: titleSize,
            color: Config.COLORS.documentHeaderText,
            align: "left",
            maxWidth: textMaxWidth,
            lineHeight,
            spacingBefore: 0,
            spacingAfter: 0,
          });
        },
      );

      if (breadcrumb && breadcrumbMetrics) {
        const crumbY = rowTop + titleHeight + BREADCRUMB_GAP;
        const crumbWidth = innerWidth - PADDING_X * 2;
        ctx.canvas.withRegion(
          {
            x: contentRegionLeft,
            y: crumbY,
            width: crumbWidth,
            height: breadcrumbHeight,
          },
          () => {
            ctx.canvas.cursorY = crumbY;
            ctx.canvas.drawText(breadcrumb, {
              font: ctx.fonts.regular,
              size: breadcrumbSize,
              color: Config.COLORS.documentHeaderSubtext,
              align: "center",
              maxWidth: crumbWidth,
              lineHeight,
              spacingBefore: 0,
              spacingAfter: 0,
            });
          },
        );
      }
    },
  );

  ctx.canvas.cursorY = textBaseline + blockHeight;
  ctx.canvas.moveY(spacingBottom);
}
