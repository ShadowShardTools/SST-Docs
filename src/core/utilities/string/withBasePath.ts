function normalizePosixPath(value: string): string {
  if (!value) return ".";

  const isAbsolute = value.startsWith("/");
  const segments = value.split("/");
  const stack: string[] = [];

  for (const segment of segments) {
    if (!segment || segment === ".") continue;

    if (segment === "..") {
      if (stack.length && stack[stack.length - 1] !== "..") {
        stack.pop();
      } else if (!isAbsolute) {
        stack.push("..");
      }
    } else {
      stack.push(segment);
    }
  }

  let normalized = stack.join("/");

  if (isAbsolute) {
    normalized = `/${normalized}`;
  } else if (!normalized) {
    normalized = ".";
  }

  const hasTrailingSlash =
    value.endsWith("/") && normalized !== "/" && !normalized.endsWith("/");

  if (hasTrailingSlash) {
    normalized += "/";
  }

  return normalized || (isAbsolute ? "/" : ".");
}

function joinUrlPath(basePath: string, rawChild: string): string {
  const normalizedBase = normalizePosixPath(basePath || "/");
  const normalizedChild = normalizePosixPath(rawChild || "").replace(
    /^\/+/,
    "",
  );

  const baseWithLeadingSlash = normalizedBase.startsWith("/")
    ? normalizedBase
    : `/${normalizedBase}`;

  return normalizePosixPath(`${baseWithLeadingSlash}/${normalizedChild}`);
}

function isAbsoluteUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export function withBasePath(raw?: string, baseUrl?: string): string {
  if (!raw) return "";

  const trimmedRaw = raw.trim();
  if (
    /^data:/i.test(trimmedRaw) ||
    /^\/\//.test(trimmedRaw) ||
    isAbsoluteUrl(trimmedRaw)
  ) {
    return trimmedRaw;
  }

  const trimmedBase = (baseUrl ?? "/").trim();

  if (trimmedBase && isAbsoluteUrl(trimmedBase)) {
    const url = new URL(trimmedBase);
    url.pathname = joinUrlPath(url.pathname, trimmedRaw);
    return url.toString();
  }

  const parsedBase = new URL(trimmedBase || "/", "http://local.placeholder");
  const joinedPath = joinUrlPath(parsedBase.pathname, trimmedRaw);
  return `${joinedPath}${parsedBase.search}${parsedBase.hash}`;
}
