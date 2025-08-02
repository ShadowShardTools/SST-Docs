import { useTheme } from "./useTheme";
import { siteConfig } from "../configs/site-config";
import type { StyleTheme } from "../types/StyleTheme";

export function useThemeStyles(): StyleTheme {
  const theme = useTheme();
  return siteConfig.themes[theme];
}
