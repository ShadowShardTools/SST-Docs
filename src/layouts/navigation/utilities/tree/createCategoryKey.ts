import { KEY_PREFIXES } from "../../constants";

export const createCategoryKey = (id: string): string =>
  `${KEY_PREFIXES.CATEGORY}${id}`;

export default createCategoryKey;
