import { z } from "zod";

import type { StyleTheme } from "../types/StyleTheme.js";

import { defaultTheme } from "./presets/default.js";

function buildSchemaFromPreset(preset: StyleTheme): z.ZodType<StyleTheme> {
  const build = (value: unknown): z.ZodTypeAny => {
    if (typeof value === "string") {
      return z.string();
    }

    if (value && typeof value === "object" && !Array.isArray(value)) {
      const shape: Record<string, z.ZodTypeAny> = {};
      Object.entries(value as Record<string, unknown>).forEach(
        ([key, child]) => {
          shape[key] = build(child);
        },
      );
      return z.object(shape).strict();
    }

    throw new Error("Invalid style theme preset shape.");
  };

  return build(preset) as z.ZodType<StyleTheme>;
}

export const styleThemeSchema = buildSchemaFromPreset(defaultTheme);

const themeCache = new WeakMap<object, StyleTheme>();
const validationStatusCache = new WeakMap<object, boolean>();

export function parseStyleTheme(theme: unknown): StyleTheme {
  if (theme && typeof theme === "object" && !Array.isArray(theme)) {
    const cached = themeCache.get(theme);
    if (cached) return cached;
  }

  const result = styleThemeSchema.safeParse(theme);
  if (!result.success) {
    throw new Error(
      `Invalid style theme provided. ${result.error.issues
        .map((issue) => `${issue.path.join(".") || "theme"}: ${issue.message}`)
        .join("; ")}`,
    );
  }

  if (theme && typeof theme === "object" && !Array.isArray(theme)) {
    themeCache.set(theme, result.data);
  }

  return result.data;
}

export function isStyleTheme(theme: unknown): theme is StyleTheme {
  if (theme && typeof theme === "object" && !Array.isArray(theme)) {
    const cached = validationStatusCache.get(theme);
    if (cached !== undefined) return cached;
  }

  const success = styleThemeSchema.safeParse(theme).success;

  if (theme && typeof theme === "object" && !Array.isArray(theme)) {
    validationStatusCache.set(theme, success);
  }

  return success;
}
