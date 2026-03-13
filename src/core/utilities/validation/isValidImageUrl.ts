import getFileExtension from "../file/getFileExtension.js";

const VALID_EXTENSIONS = new Set(["jpg", "jpeg", "png", "gif", "webp", "svg"]);

const ABSOLUTE_PROTOCOL_REGEX = /^[a-z][a-z0-9+\-.]*:/i;

export const isValidImageUrl = (rawUrl: string): boolean => {
  if (typeof rawUrl !== "string") return false;

  const trimmed = rawUrl.trim();
  if (trimmed.length === 0) return false;
  if (trimmed.startsWith("data:")) {
    return true;
  }

  try {
    // Accept relative paths by resolving them against a dummy origin.
    const urlObj = ABSOLUTE_PROTOCOL_REGEX.test(trimmed)
      ? new URL(trimmed)
      : new URL(trimmed, "http://localhost");

    if (urlObj.protocol === "data:") {
      return true;
    }

    const extension = getFileExtension(urlObj.pathname);
    return VALID_EXTENSIONS.has(extension);
  } catch {
    return false;
  }
};

export default isValidImageUrl;
