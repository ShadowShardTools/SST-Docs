export const generateId = (prefix: string) => {
  const base =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID().replace(/-/g, "")
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}${base}`;
};

export const nextIncrementTitle = (base: string, existing: Set<string>) => {
  let i = 1;
  let candidate = `${base} (${i})`;
  while (existing.has(candidate)) {
    i += 1;
    candidate = `${base} (${i})`;
  }
  return candidate;
};
