import type { HeaderBranding } from "./HeaderBranding.js";
import type { StyleTheme } from "./StyleTheme.js";

export interface ClientVisibleSstDocsConfig {
  PUBLIC_DATA_PATH: string;
  PRODUCT_VERSIONING: boolean;
  HEADER_BRANDING: HeaderBranding;
  HTML_GENERATOR_THEME?: StyleTheme;
}
