import type { rgb } from "pdf-lib";

export type RuleOptions = {
  thickness?: number; // default 1
  color?: ReturnType<typeof rgb> | null;
  spacingBefore?: number;
  spacingAfter?: number;
  width?: number; // default contentWidth
  align?: "left" | "center" | "right";
};
