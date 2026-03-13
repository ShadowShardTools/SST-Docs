import type { DocItem } from "#core";

export const getFirstAvailableItem = (
  standaloneDocs: DocItem[],
  items: DocItem[],
): DocItem | null => {
  return standaloneDocs[0] || items[0] || null;
};
