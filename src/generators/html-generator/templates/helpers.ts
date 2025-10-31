import {
  SPACING_CLASSES,
  ALIGNMENT_CLASSES,
} from "../../../layouts/blocks/constants";
import { slugify } from "../../../layouts/blocks/utilities";
import type { RenderContext } from "./types";
import type { Content } from "../../../layouts/render/types";

type SpacingKey = keyof typeof SPACING_CLASSES;
type AlignmentKey = keyof typeof ALIGNMENT_CLASSES;

const isExternalPath = (value: string) =>
  /^([a-z]+:)?\/\//i.test(value) || value.startsWith("data:");

export const escapeHtml = (
  value: string | number | boolean | null | undefined,
): string => {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

export const classNames = (
  ...classes: Array<string | undefined | false | null>
) => classes.filter(Boolean).join(" ");

export const getSpacingClass = (
  spacing: string | undefined,
  fallback: SpacingKey = "medium",
): string => {
  const key = (spacing ?? fallback) as SpacingKey;
  return SPACING_CLASSES[key] ?? "";
};

export const wrapWithSpacing = (
  html: string,
  spacing: string | undefined,
  fallback: SpacingKey = "medium",
) => {
  const spacingClass = getSpacingClass(spacing, fallback);
  if (!spacingClass) return html;
  return `<div class="${spacingClass}">${html}</div>`;
};

export const getAlignment = (
  alignment: string | undefined,
): { text: string; container: string } => {
  const key = (alignment ?? "left") as AlignmentKey;
  return ALIGNMENT_CLASSES[key] ?? ALIGNMENT_CLASSES.left;
};

export const resolveAssetPath = (ctx: RenderContext, raw?: string) => {
  if (!raw) return "";
  if (isExternalPath(raw)) return raw;

  if (ctx.resolveAssetHref) {
    const resolved = ctx.resolveAssetHref(raw);
    if (resolved) return resolved;
  }

  const cleanedBase =
    ctx.basePath === "/" ? "" : ctx.basePath.replace(/\/$/, "");
  const cleanedPath = raw.startsWith("/") ? raw : `/${raw}`;

  return `${cleanedBase}${cleanedPath}`;
};

export const renderFigureCaption = (ctx: RenderContext, caption?: string) => {
  if (!caption) return "";
  const className = classNames(ctx.styles.text.alternative ?? "", "mt-2");
  return `<figcaption class="${escapeHtml(className)}">${escapeHtml(caption)}</figcaption>`;
};

export const getBlockSpacing = (block: Content) => {
  // Many blocks store spacing inside their data objects; fall back to block.spacing.
  if (block.type === "text") return block.textData?.spacing;
  if (block.type === "title") return block.titleData?.spacing;
  if (block.type === "divider") return block.dividerData?.spacing;
  if (block.type === "messageBox") {
    const data = block.messageBoxData as
      | (typeof block.messageBoxData & { spacing?: string })
      | undefined;
    return data?.spacing;
  }
  return (block as any).spacing;
};

export const slugFromTitle = (title?: string) => {
  if (!title) return undefined;
  return slugify(title);
};
