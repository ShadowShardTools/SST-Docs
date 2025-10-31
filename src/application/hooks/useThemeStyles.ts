import { useCurrentTheme } from "./useCurrentTheme";
import { stylesConfig } from "../../configs/site-config";
import type { StyleTheme } from "../types/StyleTheme";

export function useThemeStyles(): StyleTheme {
  const theme = useCurrentTheme();
  return stylesConfig.themes[theme];
}

export default useThemeStyles;
