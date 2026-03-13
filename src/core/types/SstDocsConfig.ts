import type { HeaderBranding } from "./HeaderBranding.js";
import type {
  HtmlGeneratorSettings,
  HtmlGeneratorSettingsInput,
} from "./HtmlGeneratorSettings.js";

export interface SstDocsConfigFile {
  FS_DATA_PATH: string;
  PRODUCT_VERSIONING?: boolean;
  HEADER_BRANDING?: HeaderBranding;
  HTML_GENERATOR_SETTINGS?: HtmlGeneratorSettingsInput;
}

export interface ResolvedSstDocsConfig {
  FS_DATA_PATH: string;
  PUBLIC_DATA_PATH: string;
  PRODUCT_VERSIONING: boolean;
  HEADER_BRANDING: HeaderBranding;
  HTML_GENERATOR_SETTINGS?: HtmlGeneratorSettings;
}
