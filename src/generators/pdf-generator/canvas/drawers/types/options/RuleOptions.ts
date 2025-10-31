// types.ts (or wherever RuleOptions lives)
import type { rgb } from "pdf-lib";

export type RuleOptions = {
  thickness?: number; // default 1
  color?: ReturnType<typeof rgb> | null;
  spacingBefore?: number;
  spacingAfter?: number;
  width?: number; // default contentWidth
  align?: "left" | "center" | "right";
  orientation?: "horizontal" | "vertical"; // horizontal = default
  length?: number; // required for vertical
  x?: number; // optional override for vertical
  yTop?: number; // optional override for vertical
  /** If true, draw rule but do not advance cursor or reserve space */
  inline?: boolean;
};
