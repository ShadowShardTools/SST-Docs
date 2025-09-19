import type {
  RuleDrawingContext,
  BoxDrawingContext,
  TextDrawingContext,
  LinkRectContext,
  LinkTextContext,
  ParagraphOptions,
  ImageDrawingContext,
} from "./drawers/types";
import type { PdfCanvas } from ".";

export function createRuleContext(self: PdfCanvas): RuleDrawingContext {
  return {
    get page() {
      return self["_getPage"]();
    },
    get contentLeft() {
      return self.contentLeft;
    },
    get contentRight() {
      return self.contentRight;
    },
    get contentWidth() {
      return self.contentWidth;
    },
    get cursorY() {
      return self.cursorY;
    },
    get bottom() {
      return self.bottom; // ← added
    },
    toPdfY: (y: number) => self["_toPdfY"](y),
    ensureSpace: (opts: { minHeight: number }) => self.ensureSpace(opts),
    moveY: (dy: number) => self.moveY(dy),
  };
}

export function createBoxContext(self: PdfCanvas): BoxDrawingContext {
  return {
    get page() {
      return self["_getPage"]();
    },
    get contentLeft() {
      return self.contentLeft;
    },
    get cursorY() {
      return self.cursorY;
    },
    toPdfY: (y: number) => self["_toPdfY"](y),
    ensureSpace: (opts: { minHeight: number }) => self.ensureSpace(opts),
    moveY: (dy: number) => self.moveY(dy),
  };
}

export function createTextContext(self: PdfCanvas): TextDrawingContext {
  return {
    get page() {
      return self["_getPage"]();
    },
    fonts: self["_getFonts"](),
    get contentLeft() {
      return self.contentLeft;
    },
    get contentWidth() {
      return self.contentWidth;
    },
    get cursorY() {
      return self.cursorY;
    },
    toPdfY: (y: number) => self["_toPdfY"](y),
    ensureSpace: (opts: { minHeight: number }) => self.ensureSpace(opts),
    moveY: (dy: number) => self.moveY(dy),
    addPage: () => self.addPage(),
  };
}

export function createLinkRectContext(self: PdfCanvas): LinkRectContext {
  return {
    doc: self["_getDoc"](),
    get page() {
      return self["_getPage"]();
    },
    toPdfY: (y: number) => self["_toPdfY"](y),
  };
}

export function createLinkTextContext(self: PdfCanvas): LinkTextContext {
  return {
    doc: self["_getDoc"](),
    get page() {
      return self["_getPage"]();
    },
    toPdfY: (y: number) => self["_toPdfY"](y),
    get contentLeft() {
      return self.contentLeft;
    },
    get contentWidth() {
      return self.contentWidth;
    },
    get cursorY() {
      return self.cursorY;
    },
    fonts: self["_getFonts"](),
    measureAndWrap: (text: string, opts?: ParagraphOptions) =>
      self.measureAndWrap(text, opts),
    drawText: (text: string, opts?: ParagraphOptions) =>
      self.drawText(text, opts),
  };
}

export function createImageContext(self: PdfCanvas): ImageDrawingContext {
  return {
    get page() {
      return self["_getPage"]();
    },
    get contentLeft() {
      return self.contentLeft;
    },
    get contentRight() {
      return self.contentRight;
    },
    get contentWidth() {
      return self.contentWidth;
    },
    get bottom() {
      return self.bottom;
    },
    get cursorY() {
      return self.cursorY;
    },
    toPdfY: (y: number) => self["_toPdfY"](y),
    ensureSpace: (opts: { minHeight: number }) => self.ensureSpace(opts),
    moveY: (dy: number) => self.moveY(dy),
  };
}
