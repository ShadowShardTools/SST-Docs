import type { Content } from "../../../layouts/render/types";
import type { BlockRenderer, RenderContext } from "./types";
import {
  escapeHtml,
  classNames,
  getAlignment,
  getBlockSpacing,
  getSpacingClass,
  renderFigureCaption,
  resolveAssetPath,
  slugFromTitle,
} from "./helpers";
import {
  validateScale,
  getResponsiveWidth,
  extractYouTubeId,
  isValidYouTubeId,
} from "../../../layouts/blocks/utilities";
import type { CodeSection } from "../../../layouts/blocks/types/CodeData";
import { CODE_LANGUAGE_CONFIG } from "../../../configs/code-languages-config";
import { renderToString as renderKatexToString } from "katex";
import Prism from "prismjs";
import loadLanguages from "prismjs/components/index.js";
import { resolveChartRenderWidth } from "../render/chartAssets";

const buildSectionWrapper = (spacingClass: string, inner: string) => {
  if (!spacingClass) return inner;
  return `<div class="${escapeHtml(spacingClass)}">${inner}</div>`;
};

const renderTitleBlock: BlockRenderer = (ctx, block) => {
  const data = block.titleData;
  if (!data?.text) return null;

  const level = Math.min(Math.max(data.level ?? 1, 1), 6);
  const alignment = getAlignment(data.alignment);

  const levelMap: Record<number, string | undefined> = {
    1: ctx.styles.text.titleLevel1,
    2: ctx.styles.text.titleLevel2,
    3: ctx.styles.text.titleLevel3,
  };

  const baseClass = levelMap[level] ?? ctx.styles.text.documentTitle ?? "";
  const underlineClass = data.underline
    ? "border-b-2 pb-2 border-gray-300"
    : "";
  const headingId = data.enableAnchorLink
    ? slugFromTitle(data.text)
    : undefined;
  const spacing = getSpacingClass(data.spacing, "none");

  const anchorLink =
    headingId && data.enableAnchorLink
      ? `<a class="${escapeHtml(
          classNames(
            ctx.styles.text.titleAnchor ?? "text-blue-500",
            "ml-2 text-sm",
          ),
        )}" href="#${escapeHtml(headingId)}" aria-label="Anchor link">#</a>`
      : "";

  const heading = `<h${level}${headingId ? ` id="${escapeHtml(headingId)}"` : ""} class="${escapeHtml(
    classNames(
      alignment.text,
      "font-bold scroll-mt-20 group relative",
      baseClass,
      underlineClass,
    ),
  )}">${escapeHtml(data.text)}${anchorLink}</h${level}>`;

  const container = `<div class="${escapeHtml(
    classNames(ctx.styles.sections?.titleBackground ?? "", alignment.text),
  )}">${heading}</div>`;

  return buildSectionWrapper(spacing, container);
};

const renderTextBlock: BlockRenderer = (ctx, block) => {
  const data = block.textData;
  if (!data?.text) return null;

  const alignment = getAlignment(data.alignment);
  const spacing = getSpacingClass(data.spacing, "medium");

  const paragraph = `<p class="${escapeHtml(
    classNames(alignment.text, ctx.styles.text.general ?? ""),
  )}" style="white-space: pre-line;">${escapeHtml(data.text)}</p>`;

  return buildSectionWrapper(spacing, paragraph);
};

const renderListBlock: BlockRenderer = (ctx, block) => {
  const data = block.listData;
  const items = data?.items ?? [];
  if (items.length === 0) return null;

  const alignment = getAlignment(data?.alignment);
  const spacing = getSpacingClass(getBlockSpacing(block), "medium");
  const listType = data?.type === "ol" ? "ol" : "ul";
  const listClasses = classNames(
    ctx.styles.text.list ?? "",
    alignment.text,
    data?.type === "ol" ? "list-decimal" : "list-disc",
    data?.inside ? "ml-4" : "",
  );

  const startAttr =
    listType === "ol" && typeof data?.startNumber === "number"
      ? ` start="${escapeHtml(String(data.startNumber))}"`
      : "";

  const listItems = items
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");

  const listHtml = `<${listType} class="${escapeHtml(listClasses)}"${startAttr}${
    data?.ariaLabel ? ` aria-label="${escapeHtml(data.ariaLabel)}"` : ""
  } role="list">${listItems}</${listType}>`;

  return buildSectionWrapper(spacing, listHtml);
};

const renderDividerBlock: BlockRenderer = (ctx, block) => {
  const data = block.dividerData;
  if (!data) return null;

  const spacing = getSpacingClass(data.spacing, "medium");
  const base = classNames(
    "w-full",
    ctx.styles.divider.border ?? "border-gray-300",
  );

  const dividerClass = (() => {
    switch (data.type) {
      case "dashed":
        return classNames(base, "border-t-2 border-dashed");
      case "dotted":
        return classNames(base, "border-t-2 border-dotted");
      case "double":
        return classNames(base, "border-t-4 border-double");
      case "thick":
        return classNames(base, "border-t-2");
      case "gradient":
        return classNames(
          "h-px w-full bg-gradient-to-r",
          ctx.styles.divider.gradient ??
            "from-transparent via-gray-300 to-transparent",
        );
      default:
        return classNames(base, "border-t");
    }
  })();

  if (data.text) {
    const sideClass = dividerClass.replace("w-full", "flex-1");
    const textClass = classNames(
      "px-4",
      ctx.styles.divider.text ?? "text-gray-500 text-sm",
    );
    const html = `<div class="flex items-center"><div class="${escapeHtml(
      sideClass,
    )}"></div><span class="${escapeHtml(textClass)}">${escapeHtml(
      data.text,
    )}</span><div class="${escapeHtml(sideClass)}"></div></div>`;
    return buildSectionWrapper(spacing, html);
  }

  return buildSectionWrapper(
    spacing,
    `<div class="${escapeHtml(dividerClass)}"></div>`,
  );
};

const renderMessageBoxBlock: BlockRenderer = (ctx, block) => {
  const data = block.messageBoxData;
  if (!data?.text) return null;

  if (data.type === "quote") {
    const html = `<blockquote class="${escapeHtml(
      classNames("pl-4 py-2", ctx.styles.messageBox.quote ?? ""),
    )}">${escapeHtml(data.text)}</blockquote>`;
    return buildSectionWrapper(
      getSpacingClass(getBlockSpacing(block), "medium"),
      html,
    );
  }

  const sizeClass = (() => {
    switch (data.size) {
      case "small":
        return "p-3 text-sm";
      case "large":
        return "p-6 text-lg";
      default:
        return "p-4 text-base";
    }
  })();

  const type = data.type ?? "neutral";
  const typeClass =
    ctx.styles.messageBox[type] ?? ctx.styles.messageBox.neutral ?? "";

  const html = `<div class="${escapeHtml("my-4")}"><div class="${escapeHtml(
    classNames("rounded-lg border flex", typeClass, sizeClass),
  )}"><div class="flex-1">${escapeHtml(data.text)}</div></div></div>`;

  return html;
};

const renderTableBlock: BlockRenderer = (ctx, block) => {
  const data = block.tableData;
  if (!data?.data?.length) {
    return `<div class="${escapeHtml(classNames("mb-6 p-4", ctx.styles.table.empty ?? ""))}">No data available</div>`;
  }

  const rows = data.data
    .map((row, rowIndex) => {
      const cells = row
        .map((cell, cellIndex) => {
          const CellTag = cell.isHeader ? "th" : "td";
          const isMatrixCorner =
            data.type === "matrix" && rowIndex === 0 && cellIndex === 0;

          const cellStyle = (() => {
            if (isMatrixCorner) return ctx.styles.table.cornerCell ?? "";
            if (cell.isHeader) return ctx.styles.table.headers ?? "";
            if (data.type === "vertical" && rowIndex === 0)
              return ctx.styles.table.headers ?? "";
            if (data.type === "horizontal" && cellIndex === 0)
              return ctx.styles.table.headers ?? "";
            return ctx.styles.table.rows ?? "";
          })();

          const baseClass = classNames(
            "px-2 py-1 border-r",
            ctx.styles.table.border ?? "border-gray-200",
            cellStyle,
            "last:border-r-0",
          );

          return `<${CellTag} class="${escapeHtml(baseClass)}"${
            cell.scope ? ` scope="${escapeHtml(cell.scope)}"` : ""
          }>${escapeHtml(cell.content ?? "")}</${CellTag}>`;
        })
        .join("");

      const rowClass = classNames(
        "border-b last:border-b-0",
        ctx.styles.table.border ?? "border-gray-200",
        ctx.styles.table.rows ?? "",
      );

      return `<tr class="${escapeHtml(rowClass)}">${cells}</tr>`;
    })
    .join("");

  const tableClass = classNames(
    ctx.styles.table.border ?? "border-gray-200",
    "border rounded-lg min-w-full",
  );

  const html = `<div class="mb-6 overflow-x-auto">
    <table class="${escapeHtml(
      tableClass,
    )}" style="border-collapse: collapse; table-layout: auto;">
      <tbody>${rows}</tbody>
    </table>
  </div>`;

  return html;
};

const normaliseCodeSections = (block: Content): CodeSection[] => {
  const data = block.codeData;
  if (!data) return [];

  if (Array.isArray(data.sections) && data.sections.length > 0) {
    return data.sections.map((section) => ({
      language: section.language,
      content: section.content ?? "",
      filename: section.filename,
    }));
  }

  if (data.content) {
    return [
      {
        language: (data.language ?? "plaintext") as any,
        content: data.content,
        filename: data.name,
      },
    ];
  }

  return [];
};

const PRISM_LANGUAGE_ALIASES: Record<string, string> = {
  js: "javascript",
  jsx: "jsx",
  ts: "typescript",
  tsx: "tsx",
  mjs: "javascript",
  cjs: "javascript",
  sh: "bash",
  shell: "bash",
  zsh: "bash",
  html: "markup",
  xml: "markup",
  svg: "markup",
  yml: "yaml",
  md: "markdown",
  csharp: "csharp",
  "c#": "csharp",
  cpp: "cpp",
  "c++": "cpp",
  kt: "kotlin",
  rb: "ruby",
  ps: "powershell",
  ps1: "powershell",
  dockerfile: "docker",
  plaintext: "plaintext",
  text: "plaintext",
};

const loadedPrismLanguages = new Set<string>(["plaintext"]);

const normalizePrismLanguage = (value?: string): string => {
  if (!value) return "plaintext";
  const raw = value.toLowerCase();
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
let carouselInstanceCounter = 0;
let compareSliderInstanceCounter = 0;
let compareSliderScriptInjected = false;

const renderStaticCompareScript = () => {
  if (compareSliderScriptInjected) return "";
  compareSliderScriptInjected = true;
  return `<script>(function(){var initContainer=function(container){if(!container)return;var range=container.querySelector('[data-static-compare-range]');var beforeLabel=container.getAttribute('data-before-label')||"";var afterLabel=container.getAttribute('data-after-label')||"";var summary=container.querySelector('[data-static-compare-summary]');var apply=function(value){var numeric=Number(value);if(!isFinite(numeric)){numeric=Number(container.getAttribute('data-initial')||50);}var clamped=Math.max(0,Math.min(100,numeric));container.style.setProperty('--static-compare-position',clamped+'%');if(summary){var beforeText=beforeLabel?Math.round(clamped)+'% '+beforeLabel:'';var afterText=afterLabel?Math.round(100-clamped)+'% '+afterLabel:'';summary.textContent=beforeText&&afterText?beforeText+' / '+afterText:beforeText||afterText;}};if(range){apply(range.value);['input','change'].forEach(function(eventName){range.addEventListener(eventName,function(evt){var target=evt&&evt.target&&typeof evt.target.value!=='undefined'?evt.target:range;apply(target.value);});});}else{apply(container.getAttribute('data-initial')||50);}};var initAll=function(){var containers=document.querySelectorAll('[data-static-compare]');for(var i=0;i<containers.length;i+=1){initContainer(containers[i]);}};if(typeof window!=='undefined'){if(!window.__staticCompareInit){window.__staticCompareInit=initAll;document.addEventListener('DOMContentLoaded',initAll);}else{window.__staticCompareInit();}}})();</script>`;
};

const renderCodeBlock: BlockRenderer = (ctx, block) => {
  const sections = normaliseCodeSections(block);
  if (sections.length === 0) {
    return `<div class="${escapeHtml(
      classNames(
        "mb-6 p-4",
        ctx.styles.code.empty ?? "bg-gray-50 text-gray-500 text-sm border",
      ),
    )}">No code content provided</div>`;
  }

  const title =
    block.codeData?.name ??
    sections[0]?.filename ??
    CODE_LANGUAGE_CONFIG[
      sections[0]?.language as keyof typeof CODE_LANGUAGE_CONFIG
    ]?.name ??
    "Code";

  const renderedSections = sections.map((section) => {
    const showLineNumbers = block.codeData?.showLineNumbers !== false;
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

    const lines = (section.content ?? "").split("\n");
    const lineNumberColumn = showLineNumbers
      ? `<div class="${escapeHtml(
          classNames(
            "select-none flex-shrink-0 text-right",
            ctx.styles.code.lines ?? "",
          ),
        )}" style="padding-right:1rem;margin-right:1.25rem;">${lines
          .map(
            (_, idx) =>
              `<div class="leading-6 min-h-[1.5rem]">${escapeHtml(
                String(idx + 1),
              )}</div>`,
          )
          .join("")}</div>`
      : "";

    const whitespaceClass = wrapLines
      ? "whitespace-pre-wrap break-words"
      : "whitespace-pre";

    return {
      highlighted,
      prismLanguage,
      languageName,
      lineNumberColumn,
      whitespaceClass,
    };
  });

  const blockId = `code-block-${codeBlockInstanceCounter++}`;
  const containerClass = classNames(
    "relative mb-6 overflow-hidden rounded border border-gray-300 static-code-block",
  );

  const renderPanel = (segment: (typeof renderedSections)[number]) =>
    `<div class="static-code-panel">
      <pre class="language-${escapeHtml(
        segment.prismLanguage,
      )} text-sm w-full overflow-x-auto ${escapeHtml(
        segment.whitespaceClass,
      )}"><div class="flex min-h-full">
        ${segment.lineNumberColumn}
        <div class="flex-1 relative"><code class="language-${escapeHtml(
          segment.prismLanguage,
        )} block p-4">${segment.highlighted}</code></div>
      </div></pre>
      <div class="static-code-language-badge ${escapeHtml(
        ctx.styles.code.language ?? "",
      )}">${escapeHtml(segment.languageName)}</div>
    </div>`;

  const hasMultipleSections = renderedSections.length > 1;
  const noteClass = ctx.styles.code.language ?? "text-xs text-gray-300";
  const headerBaseClass = classNames(
    "px-3 py-2 flex flex-wrap gap-2 items-center justify-between static-code-header",
    ctx.styles.code.header ?? "",
  );
  let inputsHtml = "";
  let inlineStyle = "";
  let labelsHtml = "";
  let panelsHtml = "";

  if (hasMultipleSections) {
    const tabLabelClass = classNames(
      "static-code-tab-label",
      ctx.styles.buttons?.tabSmall ?? "",
    );
    const tabName = `${blockId}-tab`;
    const inputParts: string[] = [];
    const labelParts: string[] = [];
    const panelParts: string[] = [];
    const styleParts: string[] = [];

    renderedSections.forEach((segment, index) => {
      const nth = index + 1;
      const inputId = `${blockId}-option-${index}`;
      inputParts.push(
        `<input type="radio" name="${escapeHtml(tabName)}" id="${escapeHtml(
          inputId,
        )}" class="static-code-tab-input"${index === 0 ? " checked" : ""} />`,
      );
      labelParts.push(
        `<label class="${escapeHtml(tabLabelClass)}" for="${escapeHtml(
          inputId,
        )}">${escapeHtml(segment.languageName)}</label>`,
      );
      panelParts.push(renderPanel(segment));
      styleParts.push(
        `#${escapeHtml(blockId)} .static-code-tab-input:nth-of-type(${nth}):checked ~ .static-code-header .static-code-tab-labels label:nth-of-type(${nth}) { background-color: rgba(59, 130, 246, 0.24); border-color: rgba(59, 130, 246, 0.4); color: inherit; }
#${escapeHtml(blockId)} .static-code-tab-input:nth-of-type(${nth}):checked ~ .static-code-body .static-code-tab-panels .static-code-panel:nth-of-type(${nth}) { display: block; }`,
      );
      styleParts.push(
        `@media (prefers-color-scheme: dark) { #${escapeHtml(blockId)} .static-code-tab-input:nth-of-type(${nth}):checked ~ .static-code-header .static-code-tab-labels label:nth-of-type(${nth}) { background-color: rgba(96, 165, 250, 0.3); border-color: rgba(147, 197, 253, 0.45); color: #f8fafc; } }`,
      );
    });

    inputsHtml = inputParts.join("");
    labelsHtml = `<div class="static-code-tab-labels flex items-center gap-1 flex-wrap">${labelParts.join("")}</div>`;
    panelsHtml = panelParts.join("");
    inlineStyle = `<style>
#${escapeHtml(blockId)} .static-code-tab-panels .static-code-panel { display: none; }
${styleParts.join("\n")}
</style>`;
  } else {
    panelsHtml = renderPanel(renderedSections[0]);
  }

  if (inputsHtml) {
    inputsHtml = `\n    ${inputsHtml}`;
  }
  if (inlineStyle) {
    inlineStyle = `\n    ${inlineStyle}`;
  }

  const titleHtml = `<span class="font-mono text-sm truncate">${escapeHtml(
    title,
  )}</span>`;

  const headerLeading = hasMultipleSections
    ? `<div class="flex items-center gap-2 min-w-0 flex-1 flex-wrap">${titleHtml}${labelsHtml}</div>`
    : `<div class="flex items-center gap-2 min-w-0 flex-1 flex-wrap">${titleHtml}</div>`;

  const header = `<div class="${escapeHtml(
    headerBaseClass,
  )}">${headerLeading}<span class="${escapeHtml(
    noteClass,
  )}">Static snippet (copy/download disabled)</span></div>`;

  const body = `<div class="static-code-body">
    <div class="static-code-tab-panels">
      ${panelsHtml}
    </div>
  </div>`;

  return `<div class="${escapeHtml(containerClass)}" id="${escapeHtml(blockId)}">
    ${inputsHtml}${inlineStyle}
    ${header}
    ${body}
  </div>`;
};

const renderMathBlock: BlockRenderer = (ctx, block) => {
  const data = block.mathData;
  if (!data?.expression) return null;

  const alignment = getAlignment(data.alignment);
  const rawAlignment =
    typeof data.alignment === "string"
      ? data.alignment.toLowerCase()
      : "center";
  const alignmentKey: "left" | "center" | "right" =
    rawAlignment === "left" || rawAlignment === "right"
      ? (rawAlignment as "left" | "right")
      : "center";
  const justifyValue =
    alignmentKey === "left"
      ? "flex-start"
      : alignmentKey === "right"
        ? "flex-end"
        : "center";

  const rendered = renderKatexToString(data.expression, {
    throwOnError: false,
  });

  const containerClass = classNames(
    ctx.styles.text.math ?? "",
    alignment.text,
    "math-block",
  );
  const style = `display:flex;justify-content:${justifyValue};width:100%;`;

  const html = `<div class="${escapeHtml(containerClass)}" style="${escapeHtml(
    style,
  )}">${rendered}</div>`;

  return buildSectionWrapper(
    getSpacingClass(getBlockSpacing(block), "medium"),
    html,
  );
};

const renderAudioBlock: BlockRenderer = (ctx, block) => {
  const data = block.audioData;
  if (!data?.src) return null;

  const src = resolveAssetPath(ctx, data.src);
  const html = `<figure class="${escapeHtml(getSpacingClass(getBlockSpacing(block), "medium"))}">
    <audio controls preload="metadata" class="w-full">
      <source src="${escapeHtml(src)}"${data.mimeType ? ` type="${escapeHtml(data.mimeType)}"` : ""}/>
      Your browser does not support the audio element.
    </audio>
    ${renderFigureCaption(ctx, data.caption)}
  </figure>`;

  return html;
};

const renderImageBlock: BlockRenderer = (ctx, block) => {
  const data = block.imageData;
  if (!data?.image?.src) return null;

  const scale = validateScale(data.scale);
  const width = getResponsiveWidth(scale, false);
  const alignmentKey = (data.alignment ?? "center") as
    | "left"
    | "center"
    | "right";
  const alignment = getAlignment(alignmentKey);

  const wrapperClass = classNames(
    getSpacingClass(getBlockSpacing(block), "medium"),
    alignment.text,
  );

  const imgHtml = `<img src="${escapeHtml(
    resolveAssetPath(ctx, data.image.src),
  )}" alt="${escapeHtml(data.image.alt ?? "")}" class="w-full h-auto" />`;

  const captionHtml = data.image.alt
    ? renderFigureCaption(ctx, data.image.alt)
    : "";

  const html = `<figure class="${escapeHtml(wrapperClass)}">
    <div class="${escapeHtml(alignment.container || "mx-auto")}" style="width: ${escapeHtml(width)};">
      ${imgHtml}
      ${captionHtml}
    </div>
  </figure>`;

  return html;
};

const renderImageGridBlock: BlockRenderer = (ctx, block) => {
  const data = block.imageGridData;
  if (!data?.images?.length) return null;

  const alignmentKey = (data.alignment ?? "center") as
    | "left"
    | "center"
    | "right";
  const alignment = getAlignment(alignmentKey);
  const scale = validateScale(data.scale);
  const cellScale = scale > 0 ? scale : 1;
  const transformOrigin =
    alignmentKey === "left"
      ? "left"
      : alignmentKey === "right"
        ? "right"
        : "center";

  const wrapperClass = classNames(
    getSpacingClass(getBlockSpacing(block), "medium"),
    alignment.text,
  );

  const items = data.images
    .map(
      (image) => `<figure class="flex flex-col items-center" style="${
        cellScale !== 1
          ? `transform: scale(${escapeHtml(String(cellScale))}); transform-origin: ${escapeHtml(
              transformOrigin,
            )};`
          : ""
      }">
        <img src="${escapeHtml(resolveAssetPath(ctx, image.src))}" alt="${escapeHtml(
          image.alt ?? "",
        )}" class="w-full h-auto"/>
        ${renderFigureCaption(ctx, image.alt)}
      </figure>`,
    )
    .join("");

  const html = `<div class="${escapeHtml(wrapperClass)}">
    <div class="${escapeHtml(
      classNames(
        "grid gap-4 sm:grid-cols-2 md:grid-cols-3",
        alignment.container ?? "",
      ),
    )}">
      ${items}
    </div>
  </div>`;

  return html;
};

const renderImageCarouselBlock: BlockRenderer = (ctx, block) => {
  const data = block.imageCarouselData;
  if (!data?.images?.length) return null;

  const alignmentKey = (data.alignment ?? "center") as
    | "left"
    | "center"
    | "right";
  const alignment = getAlignment(alignmentKey);
  const scale = validateScale(data.scale);
  const width = getResponsiveWidth(scale, false);

  const carouselId = `static-carousel-${carouselInstanceCounter++}`;
  const inputName = `${carouselId}-input`;
  const total = data.images.length;
  const safeCarouselId = escapeHtml(carouselId);

  const inputs = data.images
    .map((_, index) => {
      const optionId = `${carouselId}-option-${index}`;
      return `<input type="radio" name="${escapeHtml(
        inputName,
      )}" id="${escapeHtml(optionId)}" class="static-carousel-input"${
        index === 0 ? " checked" : ""
      } />`;
    })
    .join("");

  const slides = data.images
    .map((image, index) => {
      const prevIndex = index === 0 ? total - 1 : index - 1;
      const nextIndex = index === total - 1 ? 0 : index + 1;
      const prevFor = `${carouselId}-option-${prevIndex}`;
      const nextFor = `${carouselId}-option-${nextIndex}`;

      return `<li class="static-carousel-slide">
        <figure>
          <img src="${escapeHtml(resolveAssetPath(ctx, image.src))}" alt="${escapeHtml(
            image.alt ?? "",
          )}" />
          ${renderFigureCaption(ctx, image.alt)}
        </figure>
        ${
          total > 1
            ? `<div class="static-carousel-navlinks">
                <label class="static-carousel-prev" role="button" tabindex="0" for="${escapeHtml(
                  prevFor,
                )}" aria-label="Previous slide"></label>
                <label class="static-carousel-next" role="button" tabindex="0" for="${escapeHtml(
                  nextFor,
                )}" aria-label="Next slide"></label>
              </div>`
            : ""
        }
      </li>`;
    })
    .join("");

  const highlightRules = data.images
    .map((_, index) => {
      const nth = index + 1;
      return `#${safeCarouselId} .static-carousel-input:nth-of-type(${nth}):checked ~ .static-carousel-viewport .static-carousel-slide:nth-of-type(${nth}) { display: flex; }
#${safeCarouselId} .static-carousel-input:nth-of-type(${nth}):checked ~ .static-carousel-navigation .static-carousel-navigation-list li:nth-of-type(${nth}) .static-carousel-navigation-button { background-color: rgba(59, 130, 246, 0.5); border-color: rgba(59, 130, 246, 0.65); transform: scale(1.15); }`;
    })
    .join("\n");

  const inlineStyle = `<style>#${safeCarouselId} .static-carousel-slide { display: none; }
${highlightRules}
</style>`;

  const wrapperClass = classNames(
    getSpacingClass(getBlockSpacing(block), "medium"),
    alignment.text,
  );

  const html = `<div class="${escapeHtml(wrapperClass)}">
    <div class="${escapeHtml(alignment.container ?? "")}" style="width: ${escapeHtml(width)};">
      <div class="static-carousel" id="${safeCarouselId}">
        ${inlineStyle}
        ${inputs}
        <ol class="static-carousel-viewport">
          ${slides}
        </ol>
      </div>
    </div>
  </div>`;

  return html;
};

const renderImageCompareBlock: BlockRenderer = (ctx, block) => {
  const data = block.imageCompareData;
  if (!data?.beforeImage?.src || !data?.afterImage?.src) return null;

  const alignmentKey = (data.alignment ?? "center") as
    | "left"
    | "center"
    | "right";
  const alignment = getAlignment(alignmentKey);
  const scale = validateScale(data.scale);
  const width = getResponsiveWidth(scale, false);

  const beforeCaption = data.beforeImage.alt ?? "Before";
  const afterCaption = data.afterImage.alt ?? "After";

  const wrapperClass = classNames(
    getSpacingClass(getBlockSpacing(block), "medium"),
    alignment.text,
  );

  if (data.type === "individual") {
    const containerClass = classNames(
      "flex gap-4 justify-center",
      alignment.container ?? "",
    );
    const beforeFigure = `<figure class="flex flex-col items-center"><img src="${escapeHtml(
      resolveAssetPath(ctx, data.beforeImage.src),
    )}" alt="${escapeHtml(beforeCaption)}" class="w-full h-auto"/>${renderFigureCaption(
      ctx,
      beforeCaption,
    )}</figure>`;
    const afterFigure = `<figure class="flex flex-col items-center"><img src="${escapeHtml(
      resolveAssetPath(ctx, data.afterImage.src),
    )}" alt="${escapeHtml(afterCaption)}" class="w-full h-auto"/>${renderFigureCaption(
      ctx,
      afterCaption,
    )}</figure>`;
    return `<div class="${escapeHtml(wrapperClass)}">
      <div class="${escapeHtml(containerClass)}" style="width: ${escapeHtml(width)};">
        <div class="w-1/2">${beforeFigure}</div>
        <div class="w-1/2">${afterFigure}</div>
      </div>
    </div>`;
  }

  const compareId = `static-compare-${compareSliderInstanceCounter++}`;
  const initialPercent = 50;

  const summary =
    data.showPercentage && (data.beforeImage.alt || data.afterImage.alt)
      ? `<p class="${escapeHtml(
          classNames(
            "static-compare-summary",
            ctx.styles.text.alternative ?? "",
          ),
        )}" data-static-compare-summary></p>`
      : "";

  const compareMarkup = `<div class="static-compare" id="${escapeHtml(compareId)}" data-static-compare data-before-label="${escapeHtml(
    beforeCaption,
  )}" data-after-label="${escapeHtml(afterCaption)}" data-initial="${escapeHtml(
    String(initialPercent),
  )}" style="--static-compare-position: ${escapeHtml(String(initialPercent))}%;">
    <figure class="static-compare-figure">
      <img src="${escapeHtml(
        resolveAssetPath(ctx, data.afterImage.src),
      )}" alt="${escapeHtml(afterCaption)}" class="static-compare-image static-compare-image--after"/>
      <div class="static-compare-overlay" data-static-compare-overlay>
        <img src="${escapeHtml(
          resolveAssetPath(ctx, data.beforeImage.src),
        )}" alt="${escapeHtml(beforeCaption)}" class="static-compare-image static-compare-image--before"/>
      </div>
      <div class="static-compare-handle" data-static-compare-handle aria-hidden="true"></div>
    </figure>
    <div class="static-compare-controls">
      <input type="range" min="0" max="100" value="${escapeHtml(
        String(initialPercent),
      )}" class="static-compare-range" data-static-compare-range aria-label="Reveal ${escapeHtml(
        beforeCaption,
      )} compared to ${escapeHtml(afterCaption)}" />
      ${summary}
    </div>
    <noscript><div class="static-compare-noscript">${escapeHtml(
      "Enable JavaScript to adjust the comparison slider.",
    )}</div></noscript>
  </div>`;

  const html = `<div class="${escapeHtml(wrapperClass)}">
    <div class="${escapeHtml(alignment.container ?? "")}" style="width: ${escapeHtml(width)};">
      ${compareMarkup}
    </div>
  </div>`;

  return `${html}${renderStaticCompareScript()}`;
};

const renderYoutubeBlock: BlockRenderer = (ctx, block) => {
  const data = block.youtubeData;
  if (!data?.youtubeVideoId) return null;

  const extracted = extractYouTubeId(data.youtubeVideoId);
  if (!extracted || !isValidYouTubeId(extracted)) return null;

  const alignment = getAlignment(data.alignment ?? "left");
  const scale = validateScale(data.scale);
  const width = `${Math.min(1, Math.max(0, scale)) * 100}%`;

  const caption = data.caption
    ? `<p class="${escapeHtml(
        classNames("mt-2", ctx.styles.text.alternative ?? ""),
      )}">${escapeHtml(data.caption)}</p>`
    : "";

  const html = `<div class="${escapeHtml(
    classNames(
      getSpacingClass(getBlockSpacing(block), "medium"),
      alignment.text,
    ),
  )}">
    <div class="${escapeHtml(alignment.container ?? "")}" style="width: ${escapeHtml(width)};">
      <div class="aspect-video">
        <iframe src="https://www.youtube.com/embed/${escapeHtml(
          extracted,
        )}" title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen class="w-full h-full rounded-lg border"></iframe>
      </div>
      ${caption}
    </div>
  </div>`;

  return html;
};

const renderChartBlock: BlockRenderer = (ctx, block) => {
  const data = block.chartData;
  if (!data) return null;

  const alignmentKey = data.alignment ? data.alignment : "center";
  const alignment = getAlignment(alignmentKey);
  const scale = validateScale(data.scale);
  const targetWidthPx = resolveChartRenderWidth(scale);

  const wrapperClass = classNames(
    getSpacingClass(getBlockSpacing(block), "medium"),
    alignment.text,
  );

  const asset = ctx.getChartAssetHref
    ? ctx.getChartAssetHref(data, targetWidthPx)
    : undefined;

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

  const figureContent = asset
    ? `<figure class="flex flex-col items-center gap-3">
        <img src="${escapeHtml(asset.src)}" alt="${escapeHtml(
          fallbackTitle || "Chart visualization",
        )}" width="${escapeHtml(String(asset.width))}" height="${escapeHtml(
          String(asset.height),
        )}" loading="lazy" class="w-full h-auto"/>
      </figure>`
    : `<div class="rounded-lg border border-dashed border-gray-400 bg-white/80 p-6 text-sm text-gray-500">
        Chart preview unavailable in static export.
      </div>`;

  return `<div class="${escapeHtml(wrapperClass)}">
    <div class="${escapeHtml(
      alignment.container ? alignment.container : "",
    )}" style="${escapeHtml(
      `width: 100%; max-width: ${String(
        asset && asset.width ? asset.width : targetWidthPx,
      )}px;`,
    )}">
      ${figureContent}
    </div>
  </div>`;
};

const renderUnknownBlock: BlockRenderer = () =>
  `<div class="my-4 p-4 border border-dashed border-gray-400 text-sm text-gray-500">Unsupported block type in static export.</div>`;

const renderGraphBlock: BlockRenderer = () =>
  `<div class="my-4 p-4 border border-dashed border-gray-400 text-sm text-gray-500">Graph block is not yet supported in static export.</div>`;

const renderCategoryNavigatorBlock: BlockRenderer = () => null;

const blockRendererMap: Record<string, BlockRenderer> = {
  title: renderTitleBlock,
  text: renderTextBlock,
  list: renderListBlock,
  divider: renderDividerBlock,
  messageBox: renderMessageBoxBlock,
  table: renderTableBlock,
  code: renderCodeBlock,
  math: renderMathBlock,
  audio: renderAudioBlock,
  image: renderImageBlock,
  imageGrid: renderImageGridBlock,
  imageCarousel: renderImageCarouselBlock,
  imageCompare: renderImageCompareBlock,
  youtube: renderYoutubeBlock,
  chart: renderChartBlock,
  graph: renderGraphBlock,
  categoryNavigator: renderCategoryNavigatorBlock,
};

export const renderContentBlock = (ctx: RenderContext, block: Content) => {
  const renderer = blockRendererMap[block.type ?? ""] ?? renderUnknownBlock;
  return renderer(ctx, block);
};
