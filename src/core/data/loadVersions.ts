import type { DataProvider } from "../types/DataProvider.js";
import type { Version } from "../types/Version.js";

export async function loadVersions(
  provider: DataProvider,
  dataRootAbs: string,
): Promise<Version[]> {
  return provider.readJson<Version[]>(`${dataRootAbs}/versions.json`);
}
