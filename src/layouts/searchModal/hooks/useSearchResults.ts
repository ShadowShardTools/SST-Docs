import { useMemo } from "react";
import { processSearchResults } from "../utilities/processSearchResults";
import type { SearchMatch } from "../types";
import type { Category, DocItem } from "#core";

export const useSearchResults = (
  results: Array<DocItem | Category>,
  searchTerm: string,
): SearchMatch[] => {
  return useMemo(() => {
    return processSearchResults(results, searchTerm);
  }, [results, searchTerm]);
};
