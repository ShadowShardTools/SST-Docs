import type { StyleTheme } from "../../../../application/types/StyleTheme";

export const rowClasses = (
  styles: StyleTheme,
  active: boolean,
  focused: boolean,
  depth: number,
): string =>
  [
    `flex items-center gap-2 px-2 py-1 cursor-pointer ${styles.navigation.row}`,
    depth ? "text-sm" : "text-base",
    active ? styles.navigation.rowActive : "",
    focused && !active ? styles.navigation.rowFocused : "",
    !active ? styles.navigation.rowHover : "",
  ].join(" ");

export default rowClasses;
