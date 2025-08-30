import type { rgb } from "pdf-lib";

export type BoxOptions = {
  fill?: ReturnType<typeof rgb> | null; // pdf-lib Color
  stroke?: ReturnType<typeof rgb> | null; // pdf-lib Color
  strokeWidth?: number;
  padding?: number;
};
