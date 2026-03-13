import { z } from "zod";

import {
  AVAILABLE_THEME_PRESET_NAMES,
  DEFAULT_THEME_PRESET,
  getThemePreset,
  isThemePresetName,
} from "../themes/themeRegistry.js";
import type { HeaderBranding } from "../types/HeaderBranding.js";
import type { HtmlGeneratorSettings } from "../types/HtmlGeneratorSettings.js";
import type { ResolvedSstDocsConfig } from "../types/SstDocsConfig.js";
import type { StyleTheme } from "../types/StyleTheme.js";
import { normalizeSystemPath } from "../utilities/string/normalizeSystemPath.js";

export const SST_DOCS_CONFIG_FILENAME = "sst-docs.config.json";
const DEFAULT_FS_DATA_PATH = "./public/SST-Docs/data";
const DEFAULT_PRODUCT_VERSIONING = false;
const DEFAULT_OUTPUT_DIRECTORY = "./dist/html";

export class SstDocsConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SstDocsConfigError";
  }
}

export interface SstDocsConfigFieldReference {
  key: string;
  type: string;
  required: boolean;
  default?: string;
  description: string;
}

export const SST_DOCS_CONFIG_REFERENCE: SstDocsConfigFieldReference[] = [
  {
    key: "FS_DATA_PATH",
    type: "string",
    required: true,
    default: DEFAULT_FS_DATA_PATH,
    description:
      "Absolute or project-relative path to the docs data root (contains versions.json).",
  },
  {
    key: "PRODUCT_VERSIONING",
    type: "boolean",
    required: false,
    default: `${DEFAULT_PRODUCT_VERSIONING}`,
    description: "Toggle product-level versioning for docs data.",
  },
  {
    key: "HEADER_BRANDING.logoSrc",
    type: "string",
    required: false,
    description: "Optional logo image path/URL shown in the header.",
  },
  {
    key: "HEADER_BRANDING.logoAlt",
    type: "string",
    required: false,
    description: "Optional alt text for the logo image.",
  },
  {
    key: "HEADER_BRANDING.logoText",
    type: "string",
    required: false,
    description: "Optional text fallback when no logo image is provided.",
  },
  {
    key: "HTML_GENERATOR_SETTINGS.OUTPUT_DIRECTORY",
    type: "string",
    required: true,
    default: DEFAULT_OUTPUT_DIRECTORY,
    description: "Where the HTML generator writes the output bundle.",
  },
  {
    key: "HTML_GENERATOR_SETTINGS.THEME",
    type: "string",
    required: true,
    default: DEFAULT_THEME_PRESET,
    description: `Theme preset name. Options: ${AVAILABLE_THEME_PRESET_NAMES.join(
      ", ",
    )}.`,
  },
  {
    key: "HTML_GENERATOR_SETTINGS.SEPARATE_BUILD_FOR_HTML_GENERATOR",
    type: "boolean",
    required: false,
    default: "false",
    description: "Whether to run a separate build for the HTML generator.",
  },
  {
    key: "HTML_GENERATOR_SETTINGS.PAGE_SIZE",
    type: "string",
    required: false,
    description: "Page size preset for HTML/PDF generation (e.g. Letter, A4).",
  },
  {
    key: "HTML_GENERATOR_SETTINGS.PAGE_PADDINGS",
    type: "number[4]",
    required: false,
    description: "Page padding values as [top, right, bottom, left].",
  },
  {
    key: "HTML_GENERATOR_SETTINGS.INCLUDE_TOC",
    type: "boolean",
    required: false,
    description: "Whether to include a generated table of contents.",
  },
] satisfies SstDocsConfigFieldReference[];

const optionalTrimmedString = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : undefined))
  .optional();

const HeaderBrandingSchema = z
  .object({
    logoSrc: optionalTrimmedString,
    logoAlt: optionalTrimmedString,
    logoText: optionalTrimmedString,
  })
  .strict()
  .transform((value) => value as HeaderBranding);

const HtmlGeneratorSettingsSchema = z
  .object({
    OUTPUT_DIRECTORY: z
      .string()
      .trim()
      .min(1, {
        message: `Set HTML_GENERATOR_SETTINGS.OUTPUT_DIRECTORY (default: "${DEFAULT_OUTPUT_DIRECTORY}")`,
      })
      .transform((val) => normalizeSystemPath(val)),
    THEME: z
      .string()
      .trim()
      .min(1, {
        message: `Set HTML_GENERATOR_SETTINGS.THEME (default: "${DEFAULT_THEME_PRESET}")`,
      })
      .transform((value, ctx) => {
        const normalized = value.toLowerCase();
        if (!isThemePresetName(normalized)) {
          const options = AVAILABLE_THEME_PRESET_NAMES.join(", ");
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `HTML_GENERATOR_SETTINGS.THEME must be one of: ${options} (default: "${DEFAULT_THEME_PRESET}")`,
          });
          return z.NEVER;
        }
        return cloneTheme(getThemePreset(normalized));
      }),
    SEPARATE_BUILD_FOR_HTML_GENERATOR: z.boolean().default(false),
    PAGE_SIZE: z
      .string()
      .trim()
      .min(1, {
        message: "Set HTML_GENERATOR_SETTINGS.PAGE_SIZE",
      })
      .optional(),
    PAGE_PADDINGS: z
      .array(z.number().finite())
      .length(4, {
        message:
          "HTML_GENERATOR_SETTINGS.PAGE_PADDINGS must contain 4 numbers (top, right, bottom, left).",
      })
      .optional(),
    INCLUDE_TOC: z.boolean().optional(),
  })
  .strict()
  .transform((value) => value as HtmlGeneratorSettings);

const ConfigSchema = z
  .object({
    FS_DATA_PATH: z
      .string()
      .trim()
      .min(1, {
        message: `Provide FS_DATA_PATH (default: "${DEFAULT_FS_DATA_PATH}")`,
      })
      .transform((val) => normalizeSystemPath(val)),
    PRODUCT_VERSIONING: z.boolean().default(DEFAULT_PRODUCT_VERSIONING),
    HEADER_BRANDING: HeaderBrandingSchema.optional().transform(
      (value) => value ?? {},
    ),
    HTML_GENERATOR_SETTINGS: HtmlGeneratorSettingsSchema.optional(),
  })
  .strict();

export function parseConfigContents(
  contents: string,
  sourcePath: string,
): ResolvedSstDocsConfig {
  let parsed: unknown;
  try {
    parsed = JSON.parse(contents);
  } catch (error) {
    throw new SstDocsConfigError(
      `Failed to parse ${SST_DOCS_CONFIG_FILENAME}: ${(error as Error).message}`,
    );
  }

  const result = ConfigSchema.safeParse(parsed);

  if (!result.success) {
    throw new SstDocsConfigError(
      formatConfigValidationError(sourcePath, result.error),
    );
  }

  const resolved = result.data;

  return {
    FS_DATA_PATH: resolved.FS_DATA_PATH,
    PUBLIC_DATA_PATH: derivePublicDataPath(resolved.FS_DATA_PATH),
    PRODUCT_VERSIONING: resolved.PRODUCT_VERSIONING,
    HEADER_BRANDING: resolved.HEADER_BRANDING,
    HTML_GENERATOR_SETTINGS: resolved.HTML_GENERATOR_SETTINGS,
  };
}

export function derivePublicDataPath(fsDataPath: string): string {
  const normalizedFsPath = normalizeSystemPath(fsDataPath.trim());
  const posixPath = normalizePosixPath(normalizedFsPath || "/");
  const segments = posixPath.split("/").filter(Boolean);
  const publicIndex = segments.indexOf("public");
  const publicSegments =
    publicIndex >= 0 ? segments.slice(publicIndex + 1) : segments;

  if (publicSegments.length === 0) {
    return "/";
  }

  const joined = `/${publicSegments.join("/")}`;
  return joined.endsWith("/") ? joined : `${joined}/`;
}

export function resolvePublicDataPath(
  baseUrl: string,
  config: Pick<ResolvedSstDocsConfig, "PUBLIC_DATA_PATH"> | string,
): string {
  const publicPath =
    typeof config === "string" ? config : config.PUBLIC_DATA_PATH;
  const normalizedPublicPath = normalizePublicPath(publicPath);

  if (!baseUrl || baseUrl.trim().length === 0) {
    return normalizedPublicPath;
  }

  if (isAbsoluteUrl(baseUrl)) {
    const url = new URL(baseUrl);
    url.pathname = joinUrlPaths(url.pathname || "/", normalizedPublicPath);
    return url.toString();
  }

  const parsedBase = new URL(baseUrl, "http://local.placeholder");
  const joinedPath = joinUrlPaths(
    parsedBase.pathname || "/",
    normalizedPublicPath,
  );
  return `${joinedPath}${parsedBase.search}${parsedBase.hash}`;
}

function normalizePublicPath(value: string): string {
  const normalized = normalizeSystemPath(value.trim());
  const posixPath = normalizePosixPath(normalized || "/");
  const withLeading = posixPath.startsWith("/") ? posixPath : `/${posixPath}`;
  return withLeading.endsWith("/") ? withLeading : `${withLeading}/`;
}

function joinUrlPaths(base: string, child: string): string {
  const normalizedBase = normalizePublicPath(base);
  const normalizedChild = normalizePublicPath(child).replace(/^\/+/, "");
  const joined = normalizePosixPath(
    `${normalizedBase}${normalizedChild ? `/${normalizedChild}` : ""}`,
  );
  return joined.endsWith("/") ? joined : `${joined}/`;
}

function isAbsoluteUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function cloneTheme(theme: StyleTheme): StyleTheme {
  return JSON.parse(JSON.stringify(theme)) as StyleTheme;
}

function formatConfigValidationError(
  sourcePath: string,
  error: z.ZodError,
): string {
  const lines = error.issues.map((issue) => {
    const path = issue.path.join(".") || "config";
    const defaultValue = defaultValueFor(path);
    const hint = defaultValue ? ` (default: ${defaultValue})` : "";
    return `${path}: ${issue.message}${hint}`;
  });

  return `Invalid configuration in ${sourcePath}:\n- ${lines.join("\n- ")}`;
}

function defaultValueFor(path: string): string | undefined {
  return SST_DOCS_CONFIG_REFERENCE.find((entry) => entry.key === path)?.default;
}

function normalizePosixPath(value: string): string {
  const sanitized = value.replace(/\\/g, "/");
  const hasLeadingSlash = sanitized.startsWith("/");
  const parts = sanitized.split("/");
  const stack: string[] = [];

  for (const part of parts) {
    if (!part || part === ".") continue;
    if (part === "..") {
      if (stack.length > 0 && stack[stack.length - 1] !== "..") {
        stack.pop();
      } else if (!hasLeadingSlash) {
        stack.push("..");
      }
      continue;
    }
    stack.push(part);
  }

  const normalized = stack.join("/");
  if (hasLeadingSlash) {
    return `/${normalized}`;
  }

  return normalized || ".";
}
