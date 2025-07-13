import { useTheme } from "./useTheme";
import { siteConfig } from "../configs/site-config";
import type { StyleTheme } from "../types/entities/StyleTheme";

export function useThemeStyles(): StyleTheme {
  const theme = useTheme();
  return siteConfig.themes[theme];
}
