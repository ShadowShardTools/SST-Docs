import { z } from "zod";

import { styleThemeSchema } from "../themes/styleThemeSchema.js";
import type { ClientVisibleSstDocsConfig } from "../types/ClientVisibleSstDocsConfig.js";
import type { ResolvedSstDocsConfig } from "../types/SstDocsConfig.js";

export const DEFAULT_CLIENT_CONFIG_GLOBAL = "__SST_DOCS_CONFIG__";

type ClientConfigSource = ResolvedSstDocsConfig | ClientVisibleSstDocsConfig;

export interface ClientConfigSerializationOptions {
  globalName?: string;
  pretty?: boolean;
}

export interface ExposeClientConfigOptions {
  globalName?: string;
  target?: Record<string, unknown>;
}

const headerBrandingSchema = z
  .object({
    logoSrc: z.string().optional(),
    logoAlt: z.string().optional(),
    logoText: z.string().optional(),
  })
  .strict()
  .optional()
  .default({});

const clientConfigSchema = z
  .object({
    PUBLIC_DATA_PATH: z.string(),
    PRODUCT_VERSIONING: z.boolean().default(false),
    HEADER_BRANDING: headerBrandingSchema,
    HTML_GENERATOR_THEME: styleThemeSchema.optional(),
  })
  .strict();

export function buildClientVisibleConfig(
  config: ResolvedSstDocsConfig,
): ClientVisibleSstDocsConfig {
  return {
    PUBLIC_DATA_PATH: config.PUBLIC_DATA_PATH,
    PRODUCT_VERSIONING: config.PRODUCT_VERSIONING,
    HEADER_BRANDING: config.HEADER_BRANDING,
    HTML_GENERATOR_THEME: config.HTML_GENERATOR_SETTINGS?.THEME,
  };
}

export function serializeClientConfigForBrowser(
  source: ClientConfigSource,
  options?: ClientConfigSerializationOptions,
): string {
  const payload = normalizeAndValidateClientConfigSource(source);
  const globalName = options?.globalName ?? DEFAULT_CLIENT_CONFIG_GLOBAL;
  const spacing = options?.pretty ? 2 : undefined;
  return `window.${globalName} = ${JSON.stringify(payload, null, spacing)};`;
}

export function exposeClientConfig(
  source: ClientConfigSource,
  options?: ExposeClientConfigOptions,
): ClientVisibleSstDocsConfig {
  const payload = normalizeAndValidateClientConfigSource(source);
  const target =
    options?.target ??
    (globalThis as unknown as Record<string, unknown> | undefined);

  if (!target) {
    throw new Error(
      "Unable to expose client config: no target global object was provided.",
    );
  }

  const globalName = options?.globalName ?? DEFAULT_CLIENT_CONFIG_GLOBAL;
  target[globalName] = payload;
  return payload;
}

export function readClientConfig(
  globalName = DEFAULT_CLIENT_CONFIG_GLOBAL,
): ClientVisibleSstDocsConfig {
  const globalObject = globalThis as Record<string, unknown> | undefined;
  if (!globalObject) {
    throw new Error("globalThis is not available in the current environment.");
  }

  const value = globalObject[globalName];
  return assertClientConfig(value, globalName);
}

function normalizeAndValidateClientConfigSource(
  source: ClientConfigSource,
): ClientVisibleSstDocsConfig {
  const normalized = isClientConfigShape(source)
    ? source
    : buildClientVisibleConfig(source);
  return assertClientConfig(normalized);
}

function assertClientConfig(
  value: unknown,
  globalName = DEFAULT_CLIENT_CONFIG_GLOBAL,
): ClientVisibleSstDocsConfig {
  const parsed = clientConfigSchema.safeParse(value);
  if (parsed.success) return parsed.data;

  const message = parsed.error.issues
    .map((issue) => `${issue.path.join(".") || "config"}: ${issue.message}`)
    .join("; ");

  throw new Error(
    `Client config "${globalName}" is missing or malformed on globalThis. ${message}`,
  );
}

function isClientConfigShape(
  value: unknown,
): value is ClientVisibleSstDocsConfig {
  if (!value || typeof value !== "object") return false;
  return clientConfigSchema.safeParse(value).success;
}
