// src/generator/configs.ts
import { rgb } from "pdf-lib";

export const Config = {
  PAGE: { width: 595.28, height: 841.89 },
  MARGIN: 40,
  COLORS: {
    text: rgb(0x37 / 255, 0x41 / 255, 0x51 / 255), // gray-700
    divider: rgb(0xa8 / 255, 0xa2 / 255, 0x9e / 255),
    codeBackground: rgb(0.973, 0.976, 0.98),
    codeBorder: rgb(0.914, 0.925, 0.937),

    // Titles (from your light theme)
    titleH1: rgb(0x57 / 255, 0x53 / 255, 0x4e / 255), // stone-600
    titleH2: rgb(0x1f / 255, 0x29 / 255, 0x37 / 255), // gray-800
    titleH3: rgb(0x37 / 255, 0x41 / 255, 0x51 / 255), // gray-700
    titleUnderline: rgb(0xd1 / 255, 0xd5 / 255, 0xdb / 255), // gray-300

    // Link
    link: rgb(0x25 / 255, 0x67 / 255, 0x8a / 255), // blue-700

    // ===== Table colors (mapped from Tailwind classes) =====
    // border-stone-400  #A8A29E
    border: rgb(0xa8 / 255, 0xa2 / 255, 0x9e / 255),

    // rows: bg-stone-50 #FAFAF9
    tableRow: rgb(0xfa / 255, 0xfa / 255, 0xf9 / 255),

    // headers: bg-stone-700/80  -> pre-blended over white (approx)
    // stone-700 = #44403A -> rgba(..., 0.8) over white ≈ rgb(0.413, 0.401, 0.382)
    tableHeader: rgb(0.413, 0.401, 0.382),
    tableHeaderText: rgb(1, 1, 1), // text-white

    // cornerCell: bg-stone-900/80 -> pre-blended over white (approx)
    // stone-900 = #1C1917 -> rgba(..., 0.8) over white ≈ rgb(0.288, 0.278, 0.272)
    tableCorner: rgb(0.288, 0.278, 0.272),
    tableCornerText: rgb(1, 1, 1), // text-white
  },
  LINE_HEIGHT_SCALE: 1.2,
  FONT_SIZES: {
    h1: 24,
    h2: 16,
    h3: 14,
    body: 11,
    list: 11,
    table: 11,
    messageBox: 11,
    code: 10,
    codeLabel: 10,
  },
  SPACING: {
    small: 5,
    medium: 10,
    large: 16,

    titleTop: 4,
    titleBottom: 10,
    textBottom: 4,
    listBottom: 10,
    tableBottom: 12,
    messageBoxBottom: 12,
    dividerBottom: 20,
  },
};
