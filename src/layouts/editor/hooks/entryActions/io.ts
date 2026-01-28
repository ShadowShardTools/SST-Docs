import type { ReadFn, WriteFn } from "./types";

export const readJson = async (read: ReadFn, path: string) => {
  const res = await read(path);
  return JSON.parse(res.content);
};

export const writeJson = async (
  write: WriteFn,
  path: string,
  data: unknown,
) => {
  await write(path, JSON.stringify(data, null, 2), "utf8");
};
