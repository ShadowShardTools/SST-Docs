const DRIVE_ROOT_REGEX = /^[A-Za-z]:[\\/]*$/;

export function normalizeSystemPath(p: string): string {
  const normalized = p.replace(/\\/g, "/");

  if (normalized === "/") {
    return "/";
  }

  if (DRIVE_ROOT_REGEX.test(normalized)) {
    return `${normalized.slice(0, 2)}/`;
  }

  return normalized.replace(/\/+$/, "");
}
