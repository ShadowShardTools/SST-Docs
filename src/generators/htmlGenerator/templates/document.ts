import type { DocItem, Content } from "@shadow-shard-tools/docs-core";
import type { GenerateOptions } from "../index.js";
import { escapeHtml } from "../utilities/sanitize.js";
import {
  renderTitleBlock,
  renderTextBlock,
  renderListBlock,
  renderTableBlock,
  renderMessageBoxBlock,
  renderDividerBlock,
  renderImageBlock,
  renderImageCarouselBlock,
  renderImageCompareBlock,
  renderImageGridBlock,
  renderAudioBlock,
  renderYoutubeBlock,
  renderChartBlock,
  renderCodeBlock,
  renderMathBlock,
} from "./blocks.js";

function renderBlock(
  block: Content,
  styles: GenerateOptions["theme"],
  options: GenerateOptions,
): string {
  switch (block.type) {
    case "title":
      return renderTitleBlock(block as any, styles);
    case "text":
      return renderTextBlock(block as any, styles);
    case "list":
      return renderListBlock(block as any, styles);
    case "table":
      return renderTableBlock(block as any, styles);
    case "messageBox":
      return renderMessageBoxBlock(block as any, styles);
    case "divider":
      return renderDividerBlock(block as any, styles);
    case "image":
      return renderImageBlock(block as any, styles, options);
    case "imageCarousel":
      return renderImageCarouselBlock(block as any, styles, options);
    case "imageCompare":
      return renderImageCompareBlock(block as any, styles, options);
    case "imageGrid":
      return renderImageGridBlock(block as any, styles, options);
    case "audio":
      return renderAudioBlock(block as any, styles, options);
    case "youtube":
      return renderYoutubeBlock(block as any, styles);
    case "chart":
      return renderChartBlock(block as any, styles, options);
    case "code":
      return renderCodeBlock(block as any, styles);
    case "math":
      return renderMathBlock(block as any, styles);
    default:
      return `<!-- Unknown block type: ${(block as any).type} -->`;
  }
}

export function renderDocument(
  item: DocItem,
  options: GenerateOptions,
): string {
  return renderConsolidatedDocument([item], options);
}

export function renderConsolidatedDocument(
  items: DocItem[],
  options: GenerateOptions,
): string {
  const { product, version } = options;
  const styles = options.theme;
  const documentIcon = `<svg aria-hidden="true" viewBox="0 0 24 24" class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><path d="M14 2v6h6"></path><path d="M16 13H8"></path><path d="M16 17H8"></path></svg>`;
  const folderIcon = `<svg aria-hidden="true" viewBox="0 0 24 24" class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7h5l2 2h11a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z"></path></svg>`;
  const tocIcon = `<svg aria-hidden="true" viewBox="0 0 24 24" class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" x2="21" y1="6" y2="6"></line><line x1="8" x2="21" y1="12" y2="12"></line><line x1="8" x2="21" y1="18" y2="18"></line><line x1="3" x2="3.01" y1="6" y2="6"></line><line x1="3" x2="3.01" y1="12" y2="12"></line><line x1="3" x2="3.01" y1="18" y2="18"></line></svg>`;
  const staticStylesBase = options.staticStylesBase || "../static-styles";

  // Generate full HTML document with PDF viewer styling
  const padding = Array.isArray(options.pagePaddings)
    ? options.pagePaddings
    : [20, 20, 20, 20];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(product)} - Documentation</title>
  <link rel="stylesheet" href="${staticStylesBase}/site.css">
  <link rel="stylesheet" href="${staticStylesBase}/static-code-block.css">
  <link rel="stylesheet" href="${staticStylesBase}/static-carousel.css">
  <link rel="stylesheet" href="${staticStylesBase}/static-compare.css">
  <link rel="stylesheet" href="${staticStylesBase}/prism-tomorrow.css">
  <link rel="stylesheet" href="${staticStylesBase}/splide.min.css">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap');
    
    :root {
      --page-width: 8.5in;
      --page-height: 11in;
      --page-padding-top: ${padding[0]}px;
      --page-padding-right: ${padding[1]}px;
      --page-padding-bottom: ${padding[2]}px;
      --page-padding-left: ${padding[3]}px;
    }
    
    body {
      font-family: 'Inter', sans-serif;
      background-color: #3a3a3a;
      min-height: 100vh;
    }
    
    .prose {
      font-family: 'Libre Baskerville', serif;
    }
    
    .page {
      width: var(--page-width);
      min-height: var(--page-height);
      padding: var(--page-padding-top) var(--page-padding-right) var(--page-padding-bottom) var(--page-padding-left);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
      margin: 24px auto;
      box-sizing: border-box;
    }
    
    .page-content {
      min-height: calc(var(--page-height) - var(--page-padding-top) - var(--page-padding-bottom));
    }

    .toc-entry {
      display: flex;
      align-items: baseline;
      gap: 0.75rem;
    }

    .toc-title {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .toc-leader {
      flex: 1;
      border-bottom: 1px dotted rgba(148, 163, 184, 0.9);
      transform: translateY(-0.15em);
    }

    .toc-page {
      min-width: 2.5rem;
      text-align: right;
      font-variant-numeric: tabular-nums;
    }

    @media print {
      @page {
        size: Letter;
        margin: 0;
      }
      body {
        background-color: white !important;
      }
      .page {
        width: 100%;
        min-height: 100vh;
        margin: 0;
        padding: var(--page-padding-top) var(--page-padding-right) var(--page-padding-bottom) var(--page-padding-left);
        box-shadow: none;
        page-break-after: always;
      }
      .page:last-child {
        page-break-after: auto;
      }
      .no-print {
        display: none !important;
      }
    }
    
    html {
      scroll-behavior: smooth;
    }
  </style>
</head>
<body class="py-8">
  <!-- Cover Page -->
  <div class="page ${styles.sections.contentBackground}">
    <div class="page-content flex flex-col justify-center items-center text-center">
      <h1 class="text-6xl font-black tracking-tight mb-6 ${styles.text.documentTitle}">${escapeHtml(product)}</h1>
      <div class="w-32 h-1 bg-blue-600 mb-6"></div>
      <p class="text-xl font-semibold ${styles.text.alternative}">Version ${escapeHtml(version)}</p>
      <div class="mt-16 text-sm font-mono ${styles.text.alternative}">
        <p>Generated: ${new Date().toLocaleDateString()}</p>
        <p>SST-Docs Engine</p>
      </div>
    </div>
  </div>

  ${
    options.includeTOC
      ? `
  <!-- Table of Contents Page -->
  <div class="page ${styles.sections.contentBackground}">
    <div class="page-content">
      <div class="mb-4 ${styles.sections.documentHeaderBackground}" style="margin-left: calc(var(--page-padding-left) * -1); margin-right: calc(var(--page-padding-right) * -1); margin-top: calc(var(--page-padding-top) * -1); width: calc(100% + var(--page-padding-left) + var(--page-padding-right));">
        <div class="relative flex items-center py-2" style="padding-left: var(--page-padding-left); padding-right: var(--page-padding-right); padding-top: var(--page-padding-top);">
            <div class="flex flex-col items-center gap-1 text-center w-full">
              <div class="flex items-center gap-2 ${styles.text.documentTitle}">
              ${tocIcon}
              <h1 aria-label="Table of Contents">Table of Contents</h1>
            </div>
          </div>
        </div>
      </div>
      <ul class="space-y-3">
        ${(options.tocEntries?.length
          ? options.tocEntries.map((entry, i) => ({
              id: entry.id,
              title: entry.title,
              indent: entry.indent ?? 0,
              index: i,
            }))
          : items.map((item, i) => ({
              id: item.id,
              title: item.title,
              indent: 0,
              index: i,
            }))
        )
          .map(
            (entry) => `
          <li class="toc-entry">
            <span class="text-gray-400 font-mono text-sm w-8">${entry.index + 1}.</span>
            <span style="display:inline-block; width:${entry.indent * 1.25}rem;"></span>
            <a href="#doc-${entry.id}" class="${styles.hyperlink.link} toc-title">${escapeHtml(entry.title)}</a>
            <span class="toc-leader" aria-hidden="true"></span>
            <span class="text-gray-400 font-mono text-sm toc-page">${entry.index + 1 + (options.includeTOC ? 2 : 1)}</span>
          </li>
        `,
          )
          .join("")}
      </ul>
    </div>
  </div>
  `
      : ""
  }

  <!-- Document Pages -->
  ${items
    .map((item, index) => {
      const contentBlocks = (item.content || [])
        .map((block) => renderBlock(block, styles, options))
        .filter((html) => html.length > 0)
        .join("\n\n");
      const description = item.description
        ? `<p class="text-sm italic ${styles.text.alternative}">${escapeHtml(item.description)}</p>`
        : "";
      const meta = options.itemMeta?.[item.id];
      const icon = meta?.isCategory ? folderIcon : documentIcon;
      const breadcrumb = meta?.breadcrumb ?? [];
      const breadcrumbHtml = breadcrumb.length
        ? `<nav aria-label="Breadcrumb" class="flex justify-center">
            <ol class="flex flex-wrap items-center justify-center gap-2 text-sm ${styles.text.breadcrumb}">
              ${breadcrumb
                .map(
                  (segment, i) => `
                <li class="flex items-center gap-2" ${
                  i === breadcrumb.length - 1 ? 'aria-current="page"' : ""
                }>
                  <span class="cursor-default">${escapeHtml(segment)}</span>
                  ${i === breadcrumb.length - 1 ? "" : '<span aria-hidden="true">/</span>'}
                </li>`,
                )
                .join("")}
            </ol>
          </nav>`
        : "";

      const header = `
      <div class="mb-4 ${styles.sections.documentHeaderBackground}" style="margin-left: calc(var(--page-padding-left) * -1); margin-right: calc(var(--page-padding-right) * -1); margin-top: calc(var(--page-padding-top) * -1); width: calc(100% + var(--page-padding-left) + var(--page-padding-right));">
        <div class="relative flex items-center py-2" style="padding-left: var(--page-padding-left); padding-right: var(--page-padding-right); padding-top: var(--page-padding-top);">
          <div class="flex flex-col items-center gap-1 text-center w-full">
            <div class="flex items-center gap-2 ${styles.text.documentTitle}">
              ${icon}
              <h1 aria-label="${escapeHtml(item.title)}">${escapeHtml(item.title)}</h1>
            </div>
            ${breadcrumbHtml}
          </div>
          <div class="absolute right-0 text-right text-xs text-gray-400 font-mono no-print" style="right: var(--page-padding-right);">
            <p>Page ${index + 1} of ${items.length}</p>
          </div>
        </div>
      </div>`;

      const categoryCards = meta?.isCategory
        ? (() => {
            const info = options.categoryIndex?.[item.id];
            if (!info) return "";
            const childCards = (info.children || [])
              .map((childId) => {
                const childTitle =
                  options.itemMeta?.[childId]?.breadcrumb?.slice(-1)[0] ??
                  childId.replace(/^category-/, "");
                const childItem = items.find((doc) => doc.id === childId);
                const childDescription = childItem?.description ?? "";
                return `<a href="#doc-${childId}" class="p-4 ${styles.category.cardBody} block">
                  <div class="flex items-center gap-2 ${styles.category.cardHeaderText}">
                    ${folderIcon}
                    <h3>${escapeHtml(childTitle)}</h3>
                  </div>
                  ${
                    childDescription
                      ? `<p class="${styles.category.cardDescriptionText}">${escapeHtml(
                          childDescription,
                        )}</p>`
                      : ""
                  }
                </a>`;
              })
              .join("");
            const docCards = (info.docs || [])
              .map((docId) => {
                const docItem = items.find((doc) => doc.id === docId);
                if (!docItem) return "";
                return `<a href="#doc-${docId}" class="p-4 ${styles.category.cardBody} block">
                  <div class="flex items-center gap-2 ${styles.category.cardHeaderText}">
                    ${documentIcon}
                    <h3>${escapeHtml(docItem.title)}</h3>
                  </div>
                  ${
                    docItem.description
                      ? `<p class="${styles.category.cardDescriptionText}">${escapeHtml(
                          docItem.description,
                        )}</p>`
                      : ""
                  }
                </a>`;
              })
              .join("");
            if (!childCards && !docCards) {
              return `<div class="${styles.category.empty} mt-16 text-center">This category is empty.</div>`;
            }
            return `<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">${childCards}${docCards}</div>`;
          })()
        : "";

      return `
  <div class="page ${styles.sections.contentBackground}" id="doc-${item.id}">
    <div class="page-content">
      ${header}
      <div class="max-w-none">
        ${categoryCards}
        ${meta?.isCategory ? "" : description}
        ${contentBlocks}
      </div>
    </div>
  </div>`;
    })
    .join("\n")}

  <!-- Footer Page -->
  <div class="page ${styles.sections.contentBackground}">
    <div class="page-content flex flex-col justify-center items-center text-center">
      <div class="w-24 h-1 bg-gray-300 mb-8"></div>
      <p class="text-gray-500">End of Document</p>
      <p class="text-sm text-gray-400 mt-4">&copy; ${new Date().getFullYear()} ${escapeHtml(product)}. All rights reserved.</p>
      <p class="text-xs text-gray-400 mt-1">Generated via SST-Docs</p>
    </div>
  </div>
  <button type="button" class="fixed top-4 right-4 z-50 flex justify-center items-center gap-2 p-2 rounded ${styles.buttons?.common ?? ""}" style="position: fixed; top: 1rem; right: 1rem; z-index: 9999; pointer-events: auto;" data-theme-toggle aria-label="Toggle theme" title="Toggle light/dark mode">
    <span data-theme-icon="sun" class="hidden">
      <svg aria-hidden="true" viewBox="0 0 24 24" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
      </svg>
    </span>
    <span data-theme-icon="moon" class="hidden">
      <svg aria-hidden="true" viewBox="0 0 24 24" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"></path>
      </svg>
    </span>
  </button>
  <script>
    window.Prism = window.Prism || {};
    window.Prism.manual = true;
  </script>
  <script src="${staticStylesBase}/vendor/prism.js"></script>
  <script src="${staticStylesBase}/vendor/chart.umd.js"></script>
  <script src="${staticStylesBase}/vendor/splide.min.js"></script>
  <script>
  (function () {
    var THEME_KEY = "theme";
    var storedTheme = null;
    try { storedTheme = localStorage.getItem(THEME_KEY); } catch (e) {}
    var prefersDark = false;
    try {
      prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    } catch (e) {}
    var isDark = storedTheme ? storedTheme === "dark" : prefersDark;

    var applyTheme = function (dark) {
      var theme = dark ? "dark" : "light";
      [document.documentElement, document.body].forEach(function (el) {
        if (!el) return;
        el.classList.toggle("dark", theme === "dark");
        el.classList.toggle("light", theme === "light");
        el.dataset.theme = theme;
        el.style.colorScheme = theme;
      });
      var sunIcon = document.querySelector("[data-theme-icon='sun']");
      var moonIcon = document.querySelector("[data-theme-icon='moon']");
      if (sunIcon) sunIcon.classList.toggle("hidden", theme !== "dark");
      if (moonIcon) moonIcon.classList.toggle("hidden", theme !== "light");
    };

    applyTheme(isDark);

    if (window.Splide) {
      document.querySelectorAll(".splide").forEach(function (el) {
        var raw = el.getAttribute("data-splide-options");
        var options = {};
        if (raw) {
          try { options = JSON.parse(raw); } catch (e) {}
        }
        try { new window.Splide(el, options).mount(); } catch (e) {}
      });
    }

    document.querySelectorAll("[data-static-compare]").forEach(function (container) {
      var range = container.querySelector("[data-static-compare-range]");
      var beforeLabel = container.getAttribute("data-before-label") || "";
      var afterLabel = container.getAttribute("data-after-label") || "";
      var summary = container.querySelector("[data-static-compare-summary]");
      var dragging = false;
      var apply = function (value) {
        var numeric = Number(value);
        if (!isFinite(numeric)) {
          numeric = Number(container.getAttribute("data-initial") || 50);
        }
        var clamped = Math.max(0, Math.min(100, numeric));
        container.style.setProperty("--static-compare-position", clamped + "%");
        if (summary) {
          var beforeText = beforeLabel ? Math.round(clamped) + "% " + beforeLabel : "";
          var afterText = afterLabel ? Math.round(100 - clamped) + "% " + afterLabel : "";
          summary.textContent = beforeText && afterText ? beforeText + " / " + afterText : (beforeText || afterText);
        }
      };
      var applyFromClientX = function (clientX) {
        var rect = container.getBoundingClientRect();
        if (!rect.width) return;
        var percent = ((clientX - rect.left) / rect.width) * 100;
        apply(percent);
        if (range) range.value = String(Math.max(0, Math.min(100, percent)));
      };
      if (range) {
        apply(range.value);
        ["input", "change"].forEach(function (eventName) {
          range.addEventListener(eventName, function (evt) {
            var target = evt && evt.target && typeof evt.target.value !== "undefined" ? evt.target : range;
            apply(target.value);
          });
        });
      } else {
        apply(container.getAttribute("data-initial") || 50);
      }

      container.addEventListener("pointerdown", function (event) {
        dragging = true;
        try { container.setPointerCapture(event.pointerId); } catch (e) {}
        applyFromClientX(event.clientX);
      });
      container.addEventListener("pointermove", function (event) {
        if (!dragging) return;
        applyFromClientX(event.clientX);
      });
      var stopDrag = function (event) {
        if (!dragging) return;
        dragging = false;
        try { container.releasePointerCapture(event.pointerId); } catch (e) {}
      };
      container.addEventListener("pointerup", stopDrag);
      container.addEventListener("pointercancel", stopDrag);
    });

    document.querySelectorAll("[data-code-block]").forEach(function (block) {
      var panels = Array.prototype.slice.call(block.querySelectorAll("[data-code-panel]"));
      var tabs = Array.prototype.slice.call(block.querySelectorAll("[data-code-tab]"));
      var body = block.querySelector(".static-code-body");
      var toggleLabels = Array.prototype.slice.call(block.querySelectorAll("[data-code-toggle-label]"));
      var setActive = function (index) {
        panels.forEach(function (panel, i) {
          panel.style.display = i === index ? "" : "none";
        });
        tabs.forEach(function (tab, i) {
          var inactiveClass = tab.getAttribute("data-tab") || "";
          var activeClass = tab.getAttribute("data-tab-active") || "";
          var baseClass = tab.getAttribute("data-base") || "";
          tab.className = (baseClass + " " + (i === index ? activeClass : inactiveClass)).trim();
        });
      };
      if (tabs.length) {
        tabs.forEach(function (tab, i) {
          tab.addEventListener("click", function () {
            setActive(i);
          });
        });
      }

      var applyCollapsed = function (collapsed) {
        if (!body) return;
        if (collapsed) {
          body.style.maxHeight = "0px";
          body.style.opacity = "0";
          body.style.overflow = "hidden";
        } else {
          body.style.maxHeight = "";
          body.style.opacity = "1";
          body.style.overflow = "";
        }
        block.setAttribute("data-code-collapsed", collapsed ? "true" : "false");
        toggleLabels.forEach(function (label) {
          label.textContent = collapsed ? "Show" : "Hide";
        });
      };

      var toggleButtons = Array.prototype.slice.call(block.querySelectorAll("[data-code-action='toggle']"));
      toggleButtons.forEach(function (btn) {
        btn.addEventListener("click", function () {
          var isCollapsed = block.getAttribute("data-code-collapsed") === "true";
          applyCollapsed(!isCollapsed);
        });
      });

      applyCollapsed(block.getAttribute("data-code-collapsed") === "true");

      var copyButtons = Array.prototype.slice.call(block.querySelectorAll("[data-code-action='copy']"));
      copyButtons.forEach(function (btn) {
        btn.addEventListener("click", function () {
          var activePanel = panels.find(function (panel) { return panel.style.display !== "none"; }) || panels[0];
          if (!activePanel) return;
          var code = activePanel.querySelector("code");
          var text = code ? code.textContent || "" : "";
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).catch(function () {});
          }
        });
      });

      var downloadButtons = Array.prototype.slice.call(block.querySelectorAll("[data-code-action='download']"));
      downloadButtons.forEach(function (btn) {
        btn.addEventListener("click", function () {
          var activePanel = panels.find(function (panel) { return panel.style.display !== "none"; }) || panels[0];
          if (!activePanel) return;
          var code = activePanel.querySelector("code");
          var text = code ? code.textContent || "" : "";
          var label = activePanel.getAttribute("data-code-label") || "code";
          var blob = new Blob([text], { type: "text/plain;charset=utf-8" });
          var url = URL.createObjectURL(blob);
          var link = document.createElement("a");
          link.href = url;
          link.download = label.replace(/[^a-z0-9._-]+/gi, "_");
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        });
      });
    });

    var chartInstances = [];
    var buildChartOptions = function (chartData, theme, type) {
      var baseFont = {
        family: "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        size: 12,
      };
      var options = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            labels: {
              color: theme.legendLabelColor || "#1f2937",
              font: baseFont,
            },
          },
          tooltip: {
            backgroundColor: theme.tooltipBg || "#f9fafb",
            titleColor: theme.tooltipTitleColor || "#111827",
            bodyColor: theme.tooltipBodyColor || "#1f2937",
            borderColor: theme.tooltipBorderColor || "#d1d5db",
            borderWidth: 1,
            titleFont: baseFont,
            bodyFont: baseFont,
          },
        },
      };
      if (type === "radar" || type === "polarArea") {
        options.scales = {
          r: {
            grid: { color: theme.gridLineColor || "rgba(0,0,0,0.05)", borderDash: [] },
            angleLines: { color: theme.gridLineColor || "rgba(0,0,0,0.05)", borderDash: [] },
            pointLabels: {
              color: theme.axisTickColor || "#4b5563",
              font: baseFont,
            },
            ticks: {
              color: theme.axisTickColor || "#4b5563",
              font: baseFont,
            },
          },
        };
      } else {
        options.scales = {
          x: {
            grid: { color: theme.gridLineColor || "rgba(0,0,0,0.05)", borderDash: [] },
            ticks: { color: theme.axisTickColor || "#4b5563", font: baseFont },
          },
          y: {
            grid: { color: theme.gridLineColor || "rgba(0,0,0,0.05)", borderDash: [] },
            ticks: { color: theme.axisTickColor || "#4b5563", font: baseFont },
          },
        };
      }
      return options;
    };

    var applyChartTheme = function (dark) {
      chartInstances.forEach(function (entry) {
        var theme = dark ? entry.themeDark : entry.theme;
        entry.instance.options = buildChartOptions(entry.data, theme, entry.type);
        entry.instance.update();
      });
    };

    if (window.Chart) {
      var typeMap = {
        bar: "bar",
        line: "line",
        radar: "radar",
        doughnut: "doughnut",
        polarArea: "polarArea",
        bubble: "bubble",
        pie: "pie",
        scatter: "scatter",
      };
      var isRadial = function (type) {
        return type === "radar" || type === "polarArea";
      };

      document.querySelectorAll("canvas[data-chart]").forEach(function (canvas) {
        var raw = canvas.getAttribute("data-chart");
        if (!raw) return;
        var payload;
        try { payload = JSON.parse(raw); } catch (e) { return; }
        if (!payload || !payload.data) return;

        var chartData = payload.data;
        var theme = (isDark ? payload.themeDark : payload.theme) || payload.theme || {};
        var type = typeMap[chartData.type] || "bar";
        var options = buildChartOptions(chartData, theme, type);
        if (type === "radar") {
          chartData.datasets = (chartData.datasets || []).map(function (dataset) {
            if (typeof dataset.fill === "undefined") {
              dataset.fill = false;
            }
            return dataset;
          });
        }

        try {
          var instance = new window.Chart(canvas, {
            type: type,
            data: {
              labels: chartData.labels || [],
              datasets: chartData.datasets || [],
            },
            options: options,
          });
          chartInstances.push({
            instance: instance,
            data: chartData,
            theme: payload.theme || {},
            themeDark: payload.themeDark || payload.theme || {},
            type: type,
          });
        } catch (e) {}
      });
    }

    var toggle = document.querySelector("[data-theme-toggle]");
    if (toggle) {
      toggle.addEventListener("click", function () {
        isDark = !isDark;
        applyTheme(isDark);
        try { localStorage.setItem(THEME_KEY, isDark ? "dark" : "light"); } catch (e) {}
        applyChartTheme(isDark);
      });
    }
  })();
  </script>
</body>
</html>`;
}
