import { useTheme } from "./useTheme";
import { siteConfig } from "../config/siteConfig";
import type { StyleTheme } from "../config/siteConfig";

export function useThemeStyles(): StyleTheme {
  const theme = useTheme();
  return siteConfig.themes[theme];
}
