import type { ThemePresetName } from "../themes/themeRegistry.js";

import type { StyleTheme } from "./StyleTheme.js";

export interface HtmlGeneratorSettingsInput {
  OUTPUT_DIRECTORY: string;
  THEME: ThemeSelection;
  SEPARATE_BUILD_FOR_HTML_GENERATOR?: boolean;
  PAGE_SIZE?: string;
  PAGE_PADDINGS?: [number, number, number, number];
  INCLUDE_TOC?: boolean;
}

export interface HtmlGeneratorSettings {
  OUTPUT_DIRECTORY: string;
  THEME: StyleTheme;
  SEPARATE_BUILD_FOR_HTML_GENERATOR: boolean;
  PAGE_SIZE?: string;
  PAGE_PADDINGS?: [number, number, number, number];
  INCLUDE_TOC?: boolean;
}

export type ThemeSelection = ThemePresetName;
export type { ThemePresetName };
