import { useMemo } from "react";
import type { DocItem } from "../../../types/entities/DocItem";
import { processSearchResults } from "../utilities/processSearchResults";
import type { SearchMatch } from "../types";

export const useSearchResults = (
  results: DocItem[],
  searchTerm: string,
): SearchMatch[] => {
  return useMemo(() => {
    return processSearchResults(results, searchTerm);
  }, [results, searchTerm]);
};
