import { useCurrentTheme } from "./useCurrentTheme";
import { siteConfig } from "../../configs/site-config";
import type { StyleTheme } from "../types/StyleTheme";

export function useThemeStyles(): StyleTheme {
  const theme = useCurrentTheme();
  return siteConfig.themes[theme];
}

export default useThemeStyles;
