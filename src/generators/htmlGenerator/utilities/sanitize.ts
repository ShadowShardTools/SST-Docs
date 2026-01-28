export function escapeHtml(text: string): string {
  if (text == null) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const unescapeHtml = (value: string) =>
  value
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&gt;/g, ">")
    .replace(/&lt;/g, "<")
    .replace(/&amp;/g, "&");

const escapeAttribute = (value: string) =>
  escapeHtml(value).replace(/`/g, "&#96;");

const isRelativeHref = (value: string) =>
  value.startsWith("/") ||
  value.startsWith("#") ||
  value.startsWith("./") ||
  value.startsWith("../");

const isAllowedProtocol = (value: string) =>
  ["http:", "https:", "mailto:", "tel:"].includes(value);

const sanitizeHref = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (isRelativeHref(trimmed)) return trimmed;
  try {
    const url = new URL(trimmed);
    return isAllowedProtocol(url.protocol) ? trimmed : "";
  } catch {
    return "";
  }
};

export function sanitizeRichTextStatic(
  input: string,
  linkClass?: string,
): string {
  if (!input) return "";

  let output = escapeHtml(input).replace(/\r?\n/g, "<br>");

  output = output.replace(/&lt;br\s*\/?&gt;/gi, "<br>");
  output = output.replace(/&lt;(\/?)strong&gt;/gi, "<$1strong>");
  output = output.replace(/&lt;(\/?)b&gt;/gi, "<$1strong>");
  output = output.replace(/&lt;(\/?)em&gt;/gi, "<$1em>");
  output = output.replace(/&lt;(\/?)i&gt;/gi, "<$1em>");
  output = output.replace(/&lt;(\/?)(ul|ol|li)&gt;/gi, "<$1$2>");
  output = output.replace(/&lt;(div|p)[^&gt;]*&gt;/gi, "");
  output = output.replace(/&lt;\/(div|p)&gt;/gi, "<br>");

  output = output.replace(
    /&lt;a([\s\S]*?)&gt;([\s\S]*?)&lt;\/a&gt;/gi,
    (_match, rawAttrs, inner) => {
      const hrefMatch = String(rawAttrs).match(
        /href\s*=\s*(&quot;|&#39;)(.*?)\1/i,
      );
      const hrefRaw = hrefMatch?.[2] || "";
      const href = sanitizeHref(unescapeHtml(hrefRaw));
      if (!href) return inner;

      const isExternal =
        href.startsWith("http://") || href.startsWith("https://");
      const target = isExternal
        ? ' target="_blank" rel="noopener noreferrer"'
        : "";
      const classAttr = linkClass ? ` class="${linkClass}"` : "";

      return `<a href="${escapeAttribute(href)}"${target}${classAttr}>${inner}</a>`;
    },
  );

  return output.replace(/(?:<br>\s*)+$/g, "");
}
