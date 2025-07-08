import { useTheme } from "./useTheme";
import { siteConfig } from "../siteConfig";
import type { StyleTheme } from "../siteConfig";

export function useThemeStyles(): StyleTheme {
  const theme = useTheme();
  return siteConfig.themes[theme];
}
