import { useMemo } from "react";
import { processSearchResults } from "../utilities/processSearchResults";
import type { SearchMatch } from "../types";
import type { DocItem } from "../../render/types";

export const useSearchResults = (
  results: DocItem[],
  searchTerm: string,
): SearchMatch[] => {
  return useMemo(() => {
    return processSearchResults(results, searchTerm);
  }, [results, searchTerm]);
};
