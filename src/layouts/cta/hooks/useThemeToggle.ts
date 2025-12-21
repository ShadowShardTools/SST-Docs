import { useCallback } from "react";
import { useCurrentTheme } from "../../../application/hooks";

export function useThemeToggle(): () => void {
  const [, toggle] = useCurrentTheme();
  return useCallback(() => toggle(), [toggle]);
}
