export type ReadFn = (
  path: string,
) => Promise<{ content: string; encoding: string }>;
export type Encoding = "utf8" | "base64";
export type WriteFn = (
  path: string,
  content: string,
  encoding?: Encoding,
) => Promise<{ ok: boolean; path: string }>;
export type RemoveFn = (path: string) => Promise<{ ok: boolean }>;
export type ReloadFn = (product?: string, version?: string) => Promise<boolean>;
export type NavigateFn = (to: string, options?: { replace?: boolean }) => void;
