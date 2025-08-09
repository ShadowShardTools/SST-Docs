import { rgb } from "pdf-lib";
import { Config } from "../config";
import type { RenderContext } from "../types/RenderContext";
1
const themes: Record<
    string,
    { fill: [number, number, number]; stroke: [number, number, number]; text: [number, number, number] }
> = {
    info: {
        fill: [0.878, 0.949, 1],       // bg-blue-100 (#DBEAFE)
        stroke: [0.769, 0.867, 0.933], // border-blue-300 (#C2D1EE)
        text: [0.031, 0.188, 0.388],   // text-blue-800 (#052F62)
    },
    warning: {
        fill: [1, 0.973, 0.863],       // bg-yellow-100 (#FFF7DC)
        stroke: [0.996, 0.925, 0.682], // border-yellow-300 (#FEECAA)
        text: [0.322, 0.255, 0.051],   // text-yellow-800 (#523E0D)
    },
    error: {
        fill: [0.992, 0.871, 0.871],   // bg-red-100 (#FDE0E0)
        stroke: [0.937, 0.631, 0.631], // border-red-300 (#EFA1A1)
        text: [0.451, 0.051, 0.051],   // text-red-800 (#730D0D)
    },
    success: {
        fill: [0.863, 0.945, 0.882],   // bg-green-100 (#DCF1E1)
        stroke: [0.678, 0.855, 0.737], // border-green-300 (#ADCDAF)
        text: [0.031, 0.251, 0.118],   // text-green-800 (#084021)
    },
    neutral: {
        fill: [0.961, 0.961, 0.961],   // bg-stone-100 (#F5F5F5)
        stroke: [0.827, 0.827, 0.827], // border-gray-300 (#D3D3D3)
        text: [0.106, 0.122, 0.137],   // text-gray-700 (#1B1F23)
    },
};

export function addMessageBox(
    ctx: RenderContext,
    text: string,
    type: "info" | "warning" | "error" | "success" | "neutral" | "quote" = "info",
    opts?: { size?: "small" | "medium" | "large"; showIcon?: boolean },
) {
    if (!text) return;

    // Quote block style (no icons for quotes)
    if (type === "quote") {
        const ruleW = 4;
        const padX = 10;
        const padY = 8;
        const width = Config.LETTER.width - 2 * Config.MARGIN - ruleW - padX;
        const fontSize = Config.FONT_SIZES.body;
        const lines = ctx.canvas.wrapText(text, ctx.fonts.regular, fontSize, width);
        const lh = ctx.canvas.lineHeight(ctx.fonts.regular, fontSize);
        const boxH = lines.length * lh + padY * 2;
        ctx.canvas.ensureSpace(boxH + Config.SPACING.messageBoxBottom);
        const top = ctx.canvas.getY();

        // Draw background fill for quote
        ctx.canvas.drawRect({
            x: Config.MARGIN,
            y: top,
            width: width + ruleW + padX,
            height: boxH,
            fill: rgb(0.96, 0.96, 0.96), // light gray background
            advanceCursor: false,
        });

        // Draw left rule
        ctx.canvas.drawRect({
            x: Config.MARGIN,
            y: top,
            width: ruleW,
            height: boxH,
            fill: rgb(0.7, 0.7, 0.7),
            advanceCursor: false,
        });

        // Draw quote text
        ctx.canvas.drawTextBlock({
            text,
            x: Config.MARGIN + ruleW + padX,
            y: top + padY,
            width,
            font: ctx.fonts.regular,
            size: fontSize,
            color: Config.COLORS.text,
            lineGap: 2,
            advanceCursor: false,
        });

        ctx.canvas.setY(top + boxH + Config.SPACING.messageBoxBottom);
        return;
    }

    const sizeKey = opts?.size ?? "medium";
    const showIcon = opts?.showIcon ?? true;

    const sizeMap = {
        small: { pad: 12, font: Config.FONT_SIZES.messageBox - 1, iconSize: 16 },
        medium: { pad: 16, font: Config.FONT_SIZES.messageBox, iconSize: 20 },
        large: { pad: 24, font: Config.FONT_SIZES.messageBox + 1, iconSize: 24 },
    } as const;
    const S = sizeMap[sizeKey];

    const width = Config.LETTER.width - 2 * Config.MARGIN;
    const theme = themes[type] ?? themes.info;

    // Calculate space needed for icon
    const iconSpace = showIcon && ctx.icons?.[type] ? S.iconSize + 8 : 0; // icon + gap
    const textX = Config.MARGIN + S.pad + iconSpace;
    const textW = width - S.pad * 2 - iconSpace;

    const lines = ctx.canvas.wrapText(text, ctx.fonts.regular, S.font, textW);
    const lh = ctx.canvas.lineHeight(ctx.fonts.regular, S.font);
    const textH = lines.length * lh;

    // Ensure box is tall enough for icon
    const minContentH = showIcon && ctx.icons?.[type] ? Math.max(textH, S.iconSize) : textH;
    const boxH = minContentH + S.pad * 2;

    ctx.canvas.ensureSpace(boxH + Config.SPACING.messageBoxBottom);
    const top = ctx.canvas.getY();

    // Draw background box
    ctx.canvas.drawRect({
        x: Config.MARGIN,
        y: top,
        width,
        height: boxH,
        fill: rgb(...theme.fill),
        stroke: rgb(...theme.stroke),
        lineWidth: 1.5,
        advanceCursor: false,
    });

    // Draw icon if available and enabled
    if (showIcon && ctx.icons?.[type]) {
        const iconX = Config.MARGIN + S.pad;
        const iconY = top + S.pad + (minContentH - S.iconSize) / 2; // Center vertically

        // Use the PDFPage directly since PdfCanvas doesn't have drawImage
        const page = ctx.canvas.getPage();
        page.drawImage(ctx.icons[type], {
            x: iconX,
            y: page.getHeight() - (iconY + S.iconSize), // Convert to PDF coordinate system
            width: S.iconSize,
            height: S.iconSize,
        });
    }

    // Draw text
    ctx.canvas.drawTextBlock({
        text,
        x: textX,
        y: top + S.pad,
        width: textW,
        font: ctx.fonts.regular,
        size: S.font,
        color: rgb(...theme.text),
        lineGap: 2,
        advanceCursor: false,
    });

    ctx.canvas.setY(top + boxH + Config.SPACING.messageBoxBottom);
}