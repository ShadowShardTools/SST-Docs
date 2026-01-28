import {
  ALIGNMENT_CLASSES,
  SPACING_CLASSES,
} from "@shadow-shard-tools/docs-core";
import { processListItems } from "@shadow-shard-tools/docs-core/utilities/string/processListItems";
import { slugify } from "@shadow-shard-tools/docs-core/utilities/string/slugify";
import { CODE_LANGUAGE_CONFIG } from "@shadow-shard-tools/docs-core/configs/codeLanguagesConfig";
import type { StyleTheme } from "@shadow-shard-tools/docs-core/types/StyleTheme";
import type { TitleData } from "@shadow-shard-tools/docs-core/types/TitleData";
import type { TextData } from "@shadow-shard-tools/docs-core/types/TextData";
import type { ListData } from "@shadow-shard-tools/docs-core/types/ListData";
import type {
  TableData,
  TableCell,
} from "@shadow-shard-tools/docs-core/types/TableData";
import type { MessageBoxData } from "@shadow-shard-tools/docs-core/types/MessageBoxData";
import type { DividerData } from "@shadow-shard-tools/docs-core/types/DividerData";
import type { ImageData } from "@shadow-shard-tools/docs-core/types/ImageData";
import type { ImageCarouselData } from "@shadow-shard-tools/docs-core/types/ImageCarouselData";
import type { ImageCompareData } from "@shadow-shard-tools/docs-core/types/ImageCompareData";
import type { ImageGridData } from "@shadow-shard-tools/docs-core/types/ImageGridData";
import type {
  CodeData,
  CodeSection,
} from "@shadow-shard-tools/docs-core/types/CodeData";
import type { MathData } from "@shadow-shard-tools/docs-core/types/MathData";
import type { ChartData } from "@shadow-shard-tools/docs-core/types/ChartData";
import { getResponsiveWidth } from "@shadow-shard-tools/docs-core/utilities/dom/getResponsiveWidth";
import { validateScale } from "@shadow-shard-tools/docs-core/utilities/validation/validateScale";
import { sanitizeRichTextStatic, escapeHtml } from "../utilities/sanitize.js";
import { renderToString as renderKatexToString } from "katex";
import Prism from "prismjs";
import loadLanguages from "prismjs/components/index.js";
import { resolveChartRenderWidth } from "../utilities/chartAssets.js";

type ContentBlock =
  | { type: "title"; titleData?: TitleData }
  | { type: "text"; textData?: TextData }
  | { type: "list"; listData?: ListData }
  | { type: "table"; tableData?: TableData }
  | { type: "messageBox"; messageBoxData?: MessageBoxData }
  | { type: "divider"; dividerData?: DividerData }
  | { type: "image"; imageData?: ImageData }
  | { type: "imageCarousel"; imageCarouselData?: ImageCarouselData }
  | { type: "imageCompare"; imageCompareData?: ImageCompareData }
  | { type: "imageGrid"; imageGridData?: ImageGridData }
  | { type: "chart"; chartData?: ChartData }
  | { type: "code"; codeData?: CodeData }
  | { type: "math"; mathData?: MathData };

const PRISM_LANGUAGE_ALIASES: Record<string, string> = {
  js: "javascript",
  javascript: "javascript",
  ts: "typescript",
  typescript: "typescript",
  tsx: "tsx",
  jsx: "jsx",
  html: "markup",
  xml: "markup",
  markdown: "markdown",
  latex: "latex",
  sh: "bash",
  bash: "bash",
  zsh: "bash",
  shell: "bash",
  yml: "yaml",
  yaml: "yaml",
  toml: "toml",
  json: "json",
  sql: "sql",
  powershell: "powershell",
  dockerfile: "docker",
  css: "css",
  scss: "scss",
  sass: "sass",
  less: "less",
  c: "c",
  cpp: "cpp",
  csharp: "csharp",
  java: "java",
  python: "python",
  php: "php",
  ruby: "ruby",
  go: "go",
  rust: "rust",
  swift: "swift",
  kotlin: "kotlin",
  scala: "scala",
  plaintext: "plaintext",
  text: "plaintext",
};

const loadedPrismLanguages = new Set<string>(["plaintext"]);

const normalizePrismLanguage = (value?: string): string => {
  if (!value) return "plaintext";
  const raw = value.toLowerCase();
  if (
    Object.prototype.hasOwnProperty.call(
      CODE_LANGUAGE_CONFIG,
      raw as keyof typeof CODE_LANGUAGE_CONFIG,
    )
  ) {
    return PRISM_LANGUAGE_ALIASES[raw] ?? raw;
  }
  return PRISM_LANGUAGE_ALIASES[raw] ?? raw;
};

const ensurePrismLanguage = (language: string) => {
  if (!language || loadedPrismLanguages.has(language)) return;
  try {
    loadLanguages([language]);
    loadedPrismLanguages.add(language);
  } catch {
    // Fallback handled by caller
  }
};

const highlightWithPrism = (code: string, languageRaw?: string) => {
  const prismLanguage = normalizePrismLanguage(languageRaw);
  ensurePrismLanguage(prismLanguage);

  const grammar = Prism.languages[prismLanguage] ?? Prism.languages.plaintext;

  try {
    const highlighted = Prism.highlight(code, grammar, prismLanguage);
    return { highlighted, prismLanguage };
  } catch {
    return { highlighted: escapeHtml(code), prismLanguage: "plaintext" };
  }
};

let codeBlockInstanceCounter = 0;

export function renderTitleBlock(
  block: ContentBlock,
  styles: StyleTheme,
): string {
  if (block.type !== "title" || !block.titleData) return "";

  const { text, level = 1, alignment, enableAnchorLink } = block.titleData;
  const tag = `h${level}`;
  const alignmentClass = ALIGNMENT_CLASSES[alignment ?? "left"].text;
  const levelClassMap = {
    1: styles.text.titleLevel1 || "text-4xl",
    2: styles.text.titleLevel2 || "text-3xl",
    3: styles.text.titleLevel3 || "text-2xl",
  };
  const underlineClass = "";
  const titleWrapperClass = "";
  const spacingClass = SPACING_CLASSES.none;
  const id = enableAnchorLink && text ? slugify(text) : undefined;
  const anchor =
    enableAnchorLink && id
      ? `<a href="#${id}" class="ml-2 inline-block ${styles.text.titleAnchor}" aria-label="Anchor link">#</a>`
      : "";
  const className = [
    alignmentClass,
    "font-bold scroll-mt-20 group relative",
    levelClassMap[level],
    underlineClass,
  ]
    .filter(Boolean)
    .join(" ");
  const titleId = id
    ? ` id="${escapeHtml(id)}" data-anchor-id="${escapeHtml(id)}"`
    : "";

  return `<div class="${spacingClass}"><div class="${titleWrapperClass}"><${tag}${titleId} class="${className}">${escapeHtml(text ?? "")}${anchor}</${tag}></div></div>`;
}

export function renderTextBlock(
  block: ContentBlock,
  styles: StyleTheme,
): string {
  if (block.type !== "text" || !block.textData) return "";

  const { text, alignment } = block.textData;
  const alignmentClass = ALIGNMENT_CLASSES[alignment ?? "left"].text;
  const spacingClass = SPACING_CLASSES.medium;
  const sanitized = sanitizeRichTextStatic(text ?? "", styles.hyperlink?.link);

  return `<div class="${spacingClass}"><p class="${alignmentClass} ${styles.text.general}">${sanitized}</p></div>`;
}

export function renderListBlock(
  block: ContentBlock,
  styles: StyleTheme,
): string {
  if (block.type !== "list" || !block.listData) return "";

  const processedItems = processListItems(block.listData.items);
  if (!processedItems.length) return "";

  const type = block.listData.type === "ol" ? "ol" : "ul";
  const alignmentClass =
    ALIGNMENT_CLASSES[block.listData.alignment ?? "left"]?.text;
  const listClass = [
    styles.text.list,
    type === "ol" ? "list-decimal" : "list-disc",
    block.listData.inside ? "ml-4" : "",
    alignmentClass,
  ]
    .filter(Boolean)
    .join(" ");

  const start =
    type === "ol" && block.listData.startNumber !== undefined
      ? ` start="${block.listData.startNumber}"`
      : "";
  const ariaLabel = block.listData.ariaLabel
    ? ` aria-label="${escapeHtml(block.listData.ariaLabel)}"`
    : "";
  const listItems = processedItems
    .map(
      (item: string) =>
        `  <li role="listitem">${sanitizeRichTextStatic(item, styles.hyperlink?.link)}</li>`,
    )
    .join("\n");

  return `<${type}${start}${ariaLabel} role="list" class="mb-2 ${listClass}">\n${listItems}\n</${type}>`;
}

export function renderTableBlock(
  block: ContentBlock,
  styles: StyleTheme,
): string {
  if (block.type !== "table" || !block.tableData) return "";

  const { data = [], type: tableType = "horizontal" } = block.tableData;

  if (!data.length) {
    return `<div class="${styles.table.empty} mb-6 p-4 text-center">No data available</div>`;
  }

  const rows = data
    .map((row: TableCell[], rowIndex: number) => {
      const cells = row
        .map((cell: TableCell, cellIndex: number) => {
          const isHeader =
            (tableType === "vertical" && rowIndex === 0) ||
            (tableType === "horizontal" && cellIndex === 0) ||
            (tableType === "matrix" && (rowIndex === 0 || cellIndex === 0));
          const tag = isHeader ? "th" : "td";
          const isMatrixCorner =
            tableType === "matrix" && rowIndex === 0 && cellIndex === 0;
          const baseCellClass = `px-2 py-1 border-r ${styles.table.border} last:border-r-0`;
          const cellStyle = isMatrixCorner
            ? styles.table.cornerCell
            : isHeader
              ? styles.table.headers
              : styles.table.rows;
          const scope =
            cell.scope ??
            (tableType === "horizontal" && cellIndex === 0
              ? "row"
              : tableType === "vertical" && rowIndex === 0
                ? "col"
                : tableType === "matrix"
                  ? rowIndex === 0 && cellIndex === 0
                    ? undefined
                    : rowIndex === 0
                      ? "col"
                      : cellIndex === 0
                        ? "row"
                        : undefined
                  : undefined);
          const scopeAttr = scope ? ` scope="${scope}"` : "";
          return `    <${tag}${scopeAttr} class="${baseCellClass} ${cellStyle}">${sanitizeRichTextStatic(cell.content ?? "", styles.hyperlink?.link)}</${tag}>`;
        })
        .join("\n");
      return `  <tr class="border-b ${styles.table.border} last:border-b-0 ${styles.table.rows}">\n${cells}\n  </tr>`;
    })
    .join("\n");

  return `<div class="mb-6 overflow-x-auto" style="-webkit-overflow-scrolling: touch; overflow-x: auto; white-space: nowrap;">
  <table class="${styles.table.border} border rounded-lg" style="border-collapse: collapse; table-layout: auto; min-width: 100%;">
    <tbody>
${rows}
    </tbody>
  </table>
</div>`;
}

export function renderMessageBoxBlock(
  block: ContentBlock,
  styles: StyleTheme,
): string {
  if (block.type !== "messageBox" || !block.messageBoxData) return "";

  const { type = "info", text } = block.messageBoxData;
  const typeStyles = {
    info: styles.messageBox.info,
    warning: styles.messageBox.warning,
    error: styles.messageBox.error,
    success: styles.messageBox.success,
    neutral: styles.messageBox.neutral,
    quote: styles.messageBox.quote,
  };

  if (type === "quote") {
    return `<blockquote class="pl-4 py-2 my-4 ${typeStyles.quote}">${sanitizeRichTextStatic(text ?? "", styles.hyperlink?.link)}</blockquote>`;
  }

  const classes = `rounded-lg border p-4 text-base ${typeStyles[type] ?? ""}`;
  const showIcon = block.messageBoxData.showIcon;
  const iconBase = "w-5 h-5 mr-3 flex-shrink-0";
  const icon =
    type === "info"
      ? `<svg aria-hidden="true" viewBox="0 0 24 24" class="${iconBase}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" x2="12" y1="16" y2="12"></line><line x1="12" x2="12.01" y1="8" y2="8"></line></svg>`
      : type === "warning"
        ? `<svg aria-hidden="true" viewBox="0 0 24 24" class="${iconBase}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" x2="12" y1="9" y2="13"></line><line x1="12" x2="12.01" y1="17" y2="17"></line></svg>`
        : type === "error"
          ? `<svg aria-hidden="true" viewBox="0 0 24 24" class="${iconBase}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" x2="9" y1="9" y2="15"></line><line x1="9" x2="15" y1="9" y2="15"></line></svg>`
          : type === "success"
            ? `<svg aria-hidden="true" viewBox="0 0 24 24" class="${iconBase}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"></path></svg>`
            : type === "neutral"
              ? `<svg aria-hidden="true" viewBox="0 0 24 24" class="${iconBase}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.82 1c0 2-3 3-3 3"></path><line x1="12" x2="12.01" y1="17" y2="17"></line></svg>`
              : "";

  return `<div class="my-4"><div class="${classes}"><div class="flex items-center">${showIcon ? icon : ""}<div class="flex-1"><div class="mb-2 last:mb-0">${sanitizeRichTextStatic(text ?? "", styles.hyperlink?.link)}</div></div></div></div></div>`;
}

export function renderDividerBlock(
  block: ContentBlock,
  styles: StyleTheme,
): string {
  if (block.type !== "divider" || !block.dividerData) return "";

  const { type = "line" } = block.dividerData;

  const base = `w-full ${styles.divider.border || "sst-divider-border"}`;
  const dividerClass = (() => {
    switch (type) {
      case "line":
        return `${base} border-t`;
      case "dashed":
        return `${base} border-t-2 border-dashed`;
      case "dotted":
        return `${base} border-t-2 border-dotted`;
      case "double":
        return `${base} border-t-4 border-double`;
      case "thick":
        return `${base} border-t-2`;
      case "gradient":
        return `bg-gradient-to-r ${styles.divider.gradient} h-px w-full`;
      default:
        return `${base} border-t`;
    }
  })();

  if (block.dividerData.text) {
    const sideDivider = dividerClass.replace("w-full", "flex-1");
    return `<div class="mb-6 flex items-center"><div class="${sideDivider}"></div><span class="px-4 ${styles.divider.text || "sst-divider-text"}">${escapeHtml(block.dividerData.text)}</span><div class="${sideDivider}"></div></div>`;
  }

  return `<div class="mb-6"><div class="${dividerClass}"></div></div>`;
}

function resolveImageSrc(
  src: string,
  product: string,
  version: string,
): string {
  const cleaned = src.trim();
  if (!cleaned) return "";
  if (/^(https?:)?\/\//i.test(cleaned) || cleaned.startsWith("data:")) {
    return cleaned;
  }
  const normalized = cleaned.replace(/\\/g, "/");
  const marker = `/${product}/${version}/`;
  const markerIndex = normalized.indexOf(marker);
  if (markerIndex !== -1) {
    return normalized.slice(markerIndex + marker.length);
  }
  return normalized.replace(/^\/+/, "");
}

export function renderImageBlock(
  block: ContentBlock,
  styles: StyleTheme,
  options: {
    product: string;
    version: string;
    productId?: string;
    versionId?: string;
  },
): string {
  if (block.type !== "image" || !block.imageData) return "";

  const alignment = block.imageData.alignment ?? "center";
  const scale = validateScale(block.imageData.scale);
  const width = getResponsiveWidth(scale, false);
  const baseClasses = `${SPACING_CLASSES.medium} ${ALIGNMENT_CLASSES[alignment].text}`;
  const containerAlignment = ALIGNMENT_CLASSES[alignment].container;
  const image = block.imageData.image;
  const legacySrc = (block.imageData as any).src;
  const legacyAlt = (block.imageData as any).alt;
  const src = image?.src ?? legacySrc ?? "";
  const alt = image?.alt ?? legacyAlt ?? "Image";
  const caption = image?.alt ?? (block.imageData as any).caption;
  const productMarker = options.productId ?? options.product;
  const versionMarker = options.versionId ?? options.version;
  const resolvedSrc = resolveImageSrc(src, productMarker, versionMarker);

  return `<div class="${baseClasses}"><div class="${containerAlignment}" style="width: ${width};">${resolvedSrc ? `<img src="${escapeHtml(resolvedSrc)}" alt="${escapeHtml(alt)}" class="w-full h-auto">` : ""}${caption ? `<p class="${styles.text.caption} mt-2 text-center">${escapeHtml(caption)}</p>` : ""}</div></div>`;
}

export function renderImageGridBlock(
  block: ContentBlock,
  styles: StyleTheme,
  options: {
    product: string;
    version: string;
    productId?: string;
    versionId?: string;
  },
): string {
  if (block.type !== "imageGrid" || !block.imageGridData?.images?.length)
    return "";

  const alignment = block.imageGridData.alignment ?? "center";
  const scale = validateScale(block.imageGridData.scale);
  const width = getResponsiveWidth(scale, false);
  const baseClasses = `${SPACING_CLASSES.medium} ${ALIGNMENT_CLASSES[alignment].text}`;
  const containerAlignment = ALIGNMENT_CLASSES[alignment].container;
  const productMarker = options.productId ?? options.product;
  const versionMarker = options.versionId ?? options.version;

  const imagesHtml = block.imageGridData.images
    .map((img, i) => {
      const resolvedSrc = img?.src
        ? resolveImageSrc(img.src, productMarker, versionMarker)
        : "";
      if (!resolvedSrc) return "";
      const alt = img?.alt || `Image ${i + 1}`;
      const caption = img?.alt
        ? `<p class="${styles.text.caption} mt-2 text-center">${escapeHtml(img.alt)}</p>`
        : "";
      return `<div class="flex flex-col items-center"><img src="${escapeHtml(resolvedSrc)}" alt="${escapeHtml(alt)}" class="w-full h-auto">${caption}</div>`;
    })
    .filter(Boolean)
    .join("");

  return `<div class="${baseClasses}"><div class="${containerAlignment}" style="width: ${width};"><div class="grid gap-4 sm:grid-cols-2 md:grid-cols-3">${imagesHtml}</div></div></div>`;
}

export function renderImageCarouselBlock(
  block: ContentBlock,
  styles: StyleTheme,
  options: {
    product: string;
    version: string;
    productId?: string;
    versionId?: string;
  },
): string {
  if (
    block.type !== "imageCarousel" ||
    !block.imageCarouselData?.images?.length
  )
    return "";

  const alignment = block.imageCarouselData.alignment ?? "center";
  const scale = validateScale(block.imageCarouselData.scale);
  const width = getResponsiveWidth(scale, false);
  const baseClasses = `${SPACING_CLASSES.medium} ${ALIGNMENT_CLASSES[alignment].text}`;
  const containerAlignment = ALIGNMENT_CLASSES[alignment].container;
  const productMarker = options.productId ?? options.product;
  const versionMarker = options.versionId ?? options.version;

  const carouselOptions = block.imageCarouselData.carouselOptions ?? {};
  const splideOptions = {
    type: carouselOptions.loop === false ? "slide" : "loop",
    gap: carouselOptions.gap ?? "1rem",
    arrows: carouselOptions.arrows ?? true,
    pagination: carouselOptions.pagination ?? false,
    autoplay: carouselOptions.autoplay ?? false,
    interval: carouselOptions.interval ?? 3000,
  };
  const hasPagination = splideOptions.pagination === true;

  const slides = block.imageCarouselData.images
    .map((img, i) => {
      const resolvedSrc = img?.src
        ? resolveImageSrc(img.src, productMarker, versionMarker)
        : "";
      if (!resolvedSrc) return "";
      const alt = img?.alt || `Image ${i + 1}`;
      const caption = img?.alt
        ? `<p class="${styles.text.caption} text-center">${escapeHtml(img.alt)}</p>`
        : "";
      return `<li class="splide__slide"><div class="flex flex-col items-center ${hasPagination ? "pb-8" : ""}"><img src="${escapeHtml(resolvedSrc)}" alt="${escapeHtml(alt)}" class="w-full h-auto">${caption}</div></li>`;
    })
    .filter(Boolean)
    .join("");

  return `<div class="${baseClasses}"><div class="${containerAlignment}" style="width: ${width};"><div class="splide" data-splide-options="${escapeHtml(
    JSON.stringify(splideOptions),
  )}"><div class="splide__track"><ul class="splide__list">${slides}</ul></div></div></div></div>`;
}

export function renderImageCompareBlock(
  block: ContentBlock,
  styles: StyleTheme,
  options: {
    product: string;
    version: string;
    productId?: string;
    versionId?: string;
  },
): string {
  if (block.type !== "imageCompare" || !block.imageCompareData) return "";

  const alignment = block.imageCompareData.alignment ?? "center";
  const scale = validateScale(block.imageCompareData.scale);
  const width = getResponsiveWidth(scale, false);
  const baseClasses = `${SPACING_CLASSES.medium} ${ALIGNMENT_CLASSES[alignment].text}`;
  const containerAlignment = ALIGNMENT_CLASSES[alignment].container;
  const productMarker = options.productId ?? options.product;
  const versionMarker = options.versionId ?? options.version;

  const before = block.imageCompareData.beforeImage;
  const after = block.imageCompareData.afterImage;
  const beforeSrc = before?.src
    ? resolveImageSrc(before.src, productMarker, versionMarker)
    : "";
  const afterSrc = after?.src
    ? resolveImageSrc(after.src, productMarker, versionMarker)
    : "";

  if (!beforeSrc || !afterSrc) return "";

  if (block.imageCompareData.type === "individual") {
    const beforeAlt = before?.alt || "Before";
    const afterAlt = after?.alt || "After";
    return `<div class="${baseClasses}"><div class="flex gap-4 justify-center ${containerAlignment}" style="width: ${width};"><div class="w-1/2"><img src="${escapeHtml(beforeSrc)}" alt="${escapeHtml(beforeAlt)}" class="w-full h-auto">${before?.alt ? `<p class="${styles.text.caption} mt-2 text-center">${escapeHtml(before.alt)}</p>` : ""}</div><div class="w-1/2"><img src="${escapeHtml(afterSrc)}" alt="${escapeHtml(afterAlt)}" class="w-full h-auto">${after?.alt ? `<p class="${styles.text.caption} mt-2 text-center">${escapeHtml(after.alt)}</p>` : ""}</div></div></div>`;
  }

  const percentage =
    block.imageCompareData.showPercentage && (before?.alt || after?.alt)
      ? `<p class="mt-2 ${styles.text.alternative} text-center italic static-compare-summary" data-static-compare-summary></p>`
      : "";

  const beforeCaption = before?.alt || "Before";
  const afterCaption = after?.alt || "After";
  const initialPercent = 50;

  return `<div class="${baseClasses}"><div class="${containerAlignment}" style="width: ${width};">
    <div class="static-compare" data-static-compare data-before-label="${escapeHtml(
      beforeCaption,
    )}" data-after-label="${escapeHtml(
      afterCaption,
    )}" data-initial="${escapeHtml(String(initialPercent))}" style="--static-compare-position: ${escapeHtml(
      String(initialPercent),
    )}%;">
      <figure class="static-compare-figure">
        <img src="${escapeHtml(afterSrc)}" alt="${escapeHtml(
          afterCaption,
        )}" class="static-compare-image static-compare-image--after">
        <div class="static-compare-overlay" data-static-compare-overlay>
          <img src="${escapeHtml(beforeSrc)}" alt="${escapeHtml(
            beforeCaption,
          )}" class="static-compare-image static-compare-image--before">
        </div>
        <div class="static-compare-handle" data-static-compare-handle aria-hidden="true">
          <span class="static-compare-handle-button" aria-hidden="true"></span>
        </div>
      </figure>
      ${percentage}
    </div>
  </div></div>`;
}

export function renderChartBlock(
  block: ContentBlock,
  styles: StyleTheme,
  options: {
    getChartAssetHref?: (
      chartData: ChartData,
      targetWidthPx: number,
    ) => { src: string; width: number; height: number } | null;
  },
): string {
  if (block.type !== "chart" || !block.chartData) return "";

  const data = block.chartData;
  const alignmentKey = data.alignment ? data.alignment : "center";
  const alignment =
    ALIGNMENT_CLASSES[alignmentKey as keyof typeof ALIGNMENT_CLASSES] ??
    ALIGNMENT_CLASSES.center;
  const scale = validateScale(data.scale);
  const widthPercent = getResponsiveWidth(scale, false);
  const targetWidthPx = resolveChartRenderWidth(scale);

  const datasetsForTitle = data.datasets ? data.datasets : [];
  const primaryDatasetLabel =
    datasetsForTitle.length > 0 && datasetsForTitle[0]
      ? datasetsForTitle[0].label
      : "";
  const baseTitle =
    data.title && data.title.length > 0
      ? data.title
      : primaryDatasetLabel && primaryDatasetLabel.length > 0
        ? primaryDatasetLabel
        : data.type
          ? `${data.type} chart`
          : "chart";
  const fallbackTitle = baseTitle.trim();

  const asset = options.getChartAssetHref
    ? options.getChartAssetHref(data, targetWidthPx)
    : null;

  const theme = styles.chart ?? {};
  const themeDark = styles.chartDark ?? theme;
  const chartPayload = {
    data,
    theme,
    themeDark,
    title: fallbackTitle,
  };
  const figureContent = `<figure class="flex flex-col items-center gap-3">
    <div class="aspect-video w-full">
      <canvas class="w-full h-full" data-chart="${escapeHtml(
        JSON.stringify(chartPayload),
      )}"></canvas>
    </div>
    ${
      asset
        ? `<noscript><img src="${escapeHtml(asset.src)}" alt="${escapeHtml(
            fallbackTitle || "Chart visualization",
          )}" width="${escapeHtml(String(asset.width))}" height="${escapeHtml(
            String(asset.height),
          )}" loading="lazy" class="w-full h-auto"/></noscript>`
        : ""
    }
  </figure>`;

  return `<div class="mb-6 text-center ${alignment.container ?? ""}" style="width: ${escapeHtml(
    widthPercent,
  )};"><div class="w-full">${figureContent}</div></div>`;
}

function normalizeCodeSections(codeData: CodeData): CodeSection[] {
  const isSupportedLanguage = (
    value: string | undefined,
  ): value is CodeSection["language"] =>
    !!value &&
    Object.prototype.hasOwnProperty.call(
      CODE_LANGUAGE_CONFIG,
      value as keyof typeof CODE_LANGUAGE_CONFIG,
    );

  if (codeData.sections?.length) {
    return codeData.sections.map((section) => ({
      ...section,
      language: isSupportedLanguage(section.language)
        ? section.language
        : "plaintext",
    }));
  }

  if (codeData.content) {
    return [
      {
        language: isSupportedLanguage(codeData.language)
          ? codeData.language
          : "plaintext",
        content: codeData.content,
        filename: codeData.name,
      },
    ];
  }

  return [];
}

export function renderCodeBlock(
  block: ContentBlock,
  styles: StyleTheme,
): string {
  if (block.type !== "code" || !block.codeData) return "";

  const sections = normalizeCodeSections(block.codeData);
  if (!sections.length) {
    return `<div class="mb-6 p-4 rounded ${styles.code.empty}">No code content provided</div>`;
  }

  const title =
    block.codeData.name ??
    sections[0]?.filename ??
    (sections[0]?.language
      ? (CODE_LANGUAGE_CONFIG[
          sections[0]?.language as keyof typeof CODE_LANGUAGE_CONFIG
        ]?.name ?? sections[0]?.language)
      : "Code");

  const renderedSections = sections.map((section) => {
    const wrapLines = Boolean(block.codeData?.wrapLines);
    const { highlighted, prismLanguage } = highlightWithPrism(
      section.content ?? "",
      section.language ?? undefined,
    );
    const displayKey = (section.language ??
      prismLanguage) as keyof typeof CODE_LANGUAGE_CONFIG;
    const languageName =
      CODE_LANGUAGE_CONFIG[displayKey]?.name ??
      CODE_LANGUAGE_CONFIG[prismLanguage as keyof typeof CODE_LANGUAGE_CONFIG]
        ?.name ??
      section.language ??
      prismLanguage;

    const whitespaceClass = wrapLines
      ? "whitespace-pre-wrap break-words"
      : "whitespace-pre";

    return {
      highlighted,
      prismLanguage,
      languageName,
      whitespaceClass,
      filename: section.filename,
    };
  });

  const blockId = `code-block-${codeBlockInstanceCounter++}`;
  const containerClass =
    "relative mb-6 overflow-hidden rounded static-code-block";
  const headerBaseClass = `flex items-center justify-between px-3 py-2 ${styles.code.header ?? ""}`;
  const noteClass = styles.code.language ?? "text-xs text-gray-300";
  const tabClass = styles.buttons?.tab ?? styles.buttons?.common ?? "";
  const tabActiveClass =
    styles.buttons?.tabActive ?? styles.buttons?.common ?? "";
  const buttonClass = styles.buttons?.common ?? "";

  const renderPanel = (segment: (typeof renderedSections)[number]) =>
    `<pre class="language-${escapeHtml(
      segment.prismLanguage,
    )} text-sm w-full overflow-x-auto ${escapeHtml(
      segment.whitespaceClass,
    )}"><div class="flex min-h-full px-4 py-3">
      <div class="flex-1 relative"><code class="language-${escapeHtml(
        segment.prismLanguage,
      )} block">${segment.highlighted}</code></div>
    </div></pre>`;

  const hasMultipleSections = renderedSections.length > 1;
  const panelsHtml = renderedSections
    .map((segment, index) => {
      const label =
        segment.filename || segment.languageName || `Section ${index + 1}`;
      return `<div class="static-code-panel" data-code-panel="${index}" data-code-label="${escapeHtml(
        label,
      )}" data-code-language="${escapeHtml(
        segment.languageName,
      )}" style="${index === 0 ? "" : "display:none;"}">
        ${renderPanel(segment)}
      </div>`;
    })
    .join("");

  const tabBaseClass =
    "flex justify-center items-center gap-1 py-1 px-2 text-xs";
  const tabsHtml = hasMultipleSections
    ? `<div class="flex items-center gap-1 flex-wrap" data-code-tabs>
        ${renderedSections
          .map((segment, index) => {
            const label =
              segment.filename ||
              segment.languageName ||
              `Section ${index + 1}`;
            const className = index === 0 ? tabActiveClass : tabClass;
            return `<button type="button" class="${tabBaseClass} ${escapeHtml(
              className,
            )}" data-code-tab="${index}" data-base="${escapeHtml(
              tabBaseClass,
            )}" data-tab="${escapeHtml(
              tabClass,
            )}" data-tab-active="${escapeHtml(
              tabActiveClass,
            )}" title="Switch to ${escapeHtml(label)}">${escapeHtml(
              segment.languageName,
            )}</button>`;
          })
          .join("")}
      </div>`
    : "";

  const actionsHtml = `<div class="flex gap-1 items-center flex-shrink-0">
      <button type="button" class="flex justify-center items-center gap-1 py-1 px-2 text-xs ${escapeHtml(
        buttonClass,
      )}" data-code-action="toggle" title="Toggle code block">
        <span class="hidden sm:inline" data-code-toggle-label>Hide</span>
      </button>
      <button type="button" class="flex justify-center items-center gap-1 py-1 px-2 text-xs ${escapeHtml(
        buttonClass,
      )}" data-code-action="download" title="Download code file">
        <span class="hidden sm:inline">Download</span>
      </button>
      <button type="button" class="flex justify-center items-center gap-1 py-1 px-2 text-xs ${escapeHtml(
        buttonClass,
      )}" data-code-action="copy" title="Copy code to clipboard">
        <span class="hidden sm:inline">Copy</span>
      </button>
    </div>`;

  const header = `<div class="${headerBaseClass}">
    <div class="flex items-center gap-2 min-w-0 flex-1 flex-wrap">
      ${
        hasMultipleSections
          ? `${block.codeData?.name ? `<span class="truncate">${escapeHtml(block.codeData.name)}</span>` : ""}${tabsHtml}`
          : `<span class="truncate">${escapeHtml(title ?? "")}</span>`
      }
    </div>
    ${actionsHtml}
  </div>`;

  const collapsed = block.codeData.defaultCollapsed ? "true" : "false";
  const languageBadge =
    !hasMultipleSections && renderedSections[0]?.languageName
      ? `<div class="absolute top-12 right-2 px-2 py-1 rounded text-xs backdrop-blur-sm pointer-events-none ${escapeHtml(
          noteClass,
        )}">${escapeHtml(renderedSections[0].languageName)}</div>`
      : "";

  return `<div class="${containerClass}" id="${escapeHtml(
    blockId,
  )}" data-code-block data-code-collapsed="${collapsed}">
    ${header}
    <div class="static-code-body transition-all duration-300 ease-in-out" style="${
      collapsed === "true" ? "max-height:0;opacity:0;overflow:hidden;" : ""
    }">${panelsHtml}</div>
    ${languageBadge}
  </div>`;
}

export function renderMathBlock(
  block: ContentBlock,
  styles: StyleTheme,
): string {
  if (block.type !== "math" || !block.mathData) return "";

  const { expression } = block.mathData;
  const trimmed = expression?.trim() ?? "";
  if (!trimmed) return "";
  const rawAlignment = (block.mathData.alignment ?? "center").toLowerCase();
  const alignment =
    rawAlignment === "left" || rawAlignment === "right"
      ? rawAlignment
      : "center";

  let rendered = "";
  try {
    rendered = renderKatexToString(trimmed, {
      throwOnError: false,
      output: "html",
      trust: false,
      strict: "warn",
    });
  } catch {
    rendered = `<span class="${styles.messageBox?.error || "sst-msg-error"}">Invalid LaTeX</span>`;
  }

  return `<div class="${SPACING_CLASSES.medium} ${ALIGNMENT_CLASSES[alignment].text}"><div class="${styles.text.math} math-block" style="display: flex; justify-content: ${alignment === "left" ? "flex-start" : alignment === "right" ? "flex-end" : "center"}; width: 100%; text-align: ${alignment};">${rendered}</div></div>`;
}
