export interface DataProvider {
  readJson<T>(absPath: string): Promise<T>;
  fileExists?(absPath: string): Promise<boolean>; // optional; FS provider can implement
}
