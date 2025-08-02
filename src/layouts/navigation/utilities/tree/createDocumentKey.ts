import { KEY_PREFIXES } from "../../constants";

export const createDocumentKey = (id: string): string =>
  `${KEY_PREFIXES.DOCUMENT}${id}`;

export default createDocumentKey;
