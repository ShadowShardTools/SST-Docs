// src/generator/configs.ts
import { rgb } from "pdf-lib";

export const Config = {
  PAGE: { width: 595.28, height: 841.89 },
  MARGIN: 40,
  COLORS: {
    text: rgb(0x37 / 255, 0x41 / 255, 0x51 / 255),
    alternativeText: rgb(0x9C / 255, 0xA3 / 255, 0xAF / 255),
    divider: rgb(0xa8 / 255, 0xa2 / 255, 0x9e / 255),
    codeBackground: rgb(0.973, 0.976, 0.98),
    codeBorder: rgb(0.914, 0.925, 0.937),

    // Titles (from your light theme)
    titleH1: rgb(0x57 / 255, 0x53 / 255, 0x4e / 255),
    titleH2: rgb(0x1f / 255, 0x29 / 255, 0x37 / 255),
    titleH3: rgb(0x37 / 255, 0x41 / 255, 0x51 / 255),
    titleUnderline: rgb(0xd1 / 255, 0xd5 / 255, 0xdb / 255),

    link: rgb(0x25 / 255, 0x67 / 255, 0x8a / 255),

    border: rgb(0xa8 / 255, 0xa2 / 255, 0x9e / 255),

    tableRow: rgb(0xfa / 255, 0xfa / 255, 0xf9 / 255),

    tableHeader: rgb(0.413, 0.401, 0.382),
    tableHeaderText: rgb(1, 1, 1),

    tableCorner: rgb(0.288, 0.278, 0.272),
    tableCornerText: rgb(1, 1, 1),
  },
  LINE_HEIGHT_SCALE: 1.2,
  FONT_SIZES: {
    h1: 24,
    h2: 16,
    h3: 14,
    body: 11,
    alternative: 10,
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
