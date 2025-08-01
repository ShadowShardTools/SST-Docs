export { default as SearchModal } from "./SearchModal.tsx";

export type {
  SearchModalProps,
  SearchMatch,
  SearchResultItemProps,
} from "./types.ts";

export { highlightSearchTerm } from "./utilities/highlight.ts";
export { generateSnippet } from "./utilities/generateSnippet.ts";
export { processSearchResults } from "./utilities/processSearchResults.ts";

export * from "./constants.ts";

export { default } from "./SearchModal.tsx";
