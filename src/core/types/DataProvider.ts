export interface DataProvider {
  readJson<T>(absPath: string): Promise<T>;
}
