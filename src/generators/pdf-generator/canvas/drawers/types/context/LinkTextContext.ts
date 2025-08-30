import type { LinkRectContext, ParagraphOptions } from "..";
import type { Fonts } from "../../../types";

export interface LinkTextContext extends LinkRectContext {
  contentLeft: number;
  contentWidth: number;
  cursorY: number;
  fonts: Fonts;
  measureAndWrap: (
    text: string,
    opts?: ParagraphOptions,
  ) => {
    lines: string[];
    lineHeightPx: number;
    totalHeight: number;
  };
  drawText: (
    text: string,
    opts?: ParagraphOptions,
  ) => {
    height: number;
    lines: string[];
  };
}
