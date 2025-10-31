export function withBasePath(raw?: string): string {
  if (!raw) return "";
  // leave external/data URIs untouched
  if (/^https?:\/\//i.test(raw) || /^data:/i.test(raw)) return raw;

  const base = import.meta.env.BASE_URL || "/";
  const cleanBase = base.endsWith("/") ? base.slice(0, -1) : base;
  const cleanPath = raw.replace(/^\//, ""); // remove leading slash if any

  return `${cleanBase}/${cleanPath}`;
}
