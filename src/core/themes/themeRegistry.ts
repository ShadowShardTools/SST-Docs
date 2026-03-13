import type { StyleTheme } from "../types/StyleTheme.js";

import { defaultTheme } from "./presets/default.js";

export const DOCS_CORE_THEME_PRESETS = {
  default: defaultTheme,
} as const satisfies Record<string, StyleTheme>;

export type ThemePresetName = keyof typeof DOCS_CORE_THEME_PRESETS;

export const DEFAULT_THEME_PRESET: ThemePresetName = "default";

export const AVAILABLE_THEME_PRESET_NAMES = Object.freeze(
  Object.keys(DOCS_CORE_THEME_PRESETS) as ThemePresetName[],
);

export function getThemePreset(
  name: ThemePresetName = DEFAULT_THEME_PRESET,
): StyleTheme {
  const preset = DOCS_CORE_THEME_PRESETS[name];
  if (!preset) {
    const options = AVAILABLE_THEME_PRESET_NAMES.join(", ");
    throw new Error(
      `Unknown theme preset "${String(name)}". Supported presets: ${options}`,
    );
  }
  return preset;
}

export function isThemePresetName(value: unknown): value is ThemePresetName {
  return (
    typeof value === "string" &&
    AVAILABLE_THEME_PRESET_NAMES.includes(value as ThemePresetName)
  );
}
