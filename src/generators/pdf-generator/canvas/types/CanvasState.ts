import type { Region } from "sharp";
import type { ParagraphOptions } from "../drawers/types";

export type CanvasState = {
  font?: ParagraphOptions["font"];
  size?: number;
  color?: ParagraphOptions["color"];
  align?: ParagraphOptions["align"];
  lineHeight?: number; // multiplier
  region?: Region;
};