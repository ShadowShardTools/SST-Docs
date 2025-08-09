// src/generator/configs.ts

import { rgb } from "pdf-lib";

export const Config = {
  LETTER: { width: 612, height: 792 },
  MARGIN: 40,
  COLORS: {
    text: rgb(0, 0, 0),
    divider: rgb(0.87, 0.87, 0.87),
    codeBackground: rgb(0.973, 0.976, 0.98),
    codeBorder: rgb(0.914, 0.925, 0.937),
  },
  LINE_HEIGHT_SCALE: 1.2,
  FONT_SIZES: {
    h1: 24,
    h2: 16,
    h3: 14,
    body: 12,
    list: 12,
    table: 10,
    messageBox: 11,
    code: 10,
    codeLabel: 10,
  },
  SPACING: {
    titleTop: 20,
    titleBottom: 10,
    textBottom: 5,
    listBottom: 10,
    tableBottom: 15,
    messageBoxBottom: 15,
    dividerBottom: 20,
    codeBottom: 15,
  },
};
