export function normalizeBaseUrlPath(basePath: string | undefined) {
  if (!basePath) return "/";
  if (basePath === "/") return "/";
  const trimmed = basePath.replace(/\/+$/, "");
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}
