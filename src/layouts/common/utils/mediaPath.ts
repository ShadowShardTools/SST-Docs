import { resolvePublicDataPath } from "@shadow-shard-tools/docs-core/configs";
import { withBasePath } from "@shadow-shard-tools/docs-core";
import { clientConfig } from "../../../application/config/clientConfig";

const isAbsoluteUrl = (value: string) => {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

const normalizeRelativePath = (value: string) =>
  value.replace(/^[.\\/]+/, "").replace(/\\/g, "/");

export const resolveMediaPath = (raw?: string) => {
  if (!raw) return "";
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (
    /^data:/i.test(trimmed) ||
    /^blob:/i.test(trimmed) ||
    /^\/\//.test(trimmed) ||
    isAbsoluteUrl(trimmed)
  ) {
    return trimmed;
  }
  if (trimmed.startsWith("/")) {
    return withBasePath(trimmed, import.meta.env.BASE_URL);
  }
  const publicBase = resolvePublicDataPath(
    import.meta.env.BASE_URL ?? "/",
    clientConfig,
  );
  return `${publicBase}${normalizeRelativePath(trimmed)}`;
};

export default resolveMediaPath;
