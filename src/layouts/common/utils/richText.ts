import type { StyleTheme } from "@shadow-shard-tools/docs-core";

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const escapeAttribute = (value: string) =>
  escapeHtml(value).replace(/`/g, "&#96;");

const normalizeHref = (value: string) => value.trim();

const isRelativeHref = (value: string) =>
  value.startsWith("/") ||
  value.startsWith("#") ||
  value.startsWith("./") ||
  value.startsWith("../");

const isAllowedProtocol = (value: string) =>
  ["http:", "https:", "mailto:", "tel:"].includes(value);

const sanitizeHref = (value: string) => {
  const trimmed = normalizeHref(value);
  if (!trimmed) return "";
  if (isRelativeHref(trimmed)) return trimmed;
  try {
    const url = new URL(trimmed);
    return isAllowedProtocol(url.protocol) ? trimmed : "";
  } catch {
    return "";
  }
};

const trimTrailingBreaks = (value: string) =>
  value.replace(/(?:<br>\s*)+$/g, "");

const sanitizeWithDom = (input: string, styles?: StyleTheme) => {
  const container = document.createElement("div");
  container.innerHTML = input;

  const walk = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) {
      return escapeHtml(node.textContent ?? "").replace(/\r?\n/g, "<br>");
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return "";
    }

    const element = node as HTMLElement;
    const tag = element.tagName.toUpperCase();
    const children = Array.from(element.childNodes).map(walk).join("");

    if (tag === "BR") {
      return "<br>";
    }

    if (tag === "B" || tag === "STRONG") {
      return `<strong>${children}</strong>`;
    }

    if (tag === "I" || tag === "EM") {
      return `<em>${children}</em>`;
    }

    if (tag === "A") {
      const href = sanitizeHref(element.getAttribute("href") ?? "");
      if (!href) return children;
      const isExternal =
        href.startsWith("http://") || href.startsWith("https://");
      const target = isExternal
        ? ' target="_blank" rel="noopener noreferrer"'
        : "";

      const linkClass = styles?.hyperlink?.link
        ? ` class="${styles.hyperlink.link}"`
        : "";

      return `<a href="${escapeAttribute(href)}"${target}${linkClass}>${children}</a>`;
    }

    if (tag === "DIV" || tag === "P") {
      return `${children}<br>`;
    }

    if (tag === "UL" || tag === "OL") {
      return `<${tag.toLowerCase()}>${children}</${tag.toLowerCase()}>`;
    }

    if (tag === "LI") {
      return `<li>${children}</li>`;
    }

    return children;
  };

  return trimTrailingBreaks(
    Array.from(container.childNodes).map(walk).join(""),
  );
};

export const sanitizeRichText = (input: string, styles?: StyleTheme) => {
  if (!input) return "";
  if (typeof document === "undefined") {
    return escapeHtml(input).replace(/\r?\n/g, "<br>");
  }
  return sanitizeWithDom(input, styles);
};
