import type { GeneratorConfig } from "../../types";
import type { NavigationIndex, NavDocumentEntry } from "./navigation";
import { renderBlocks } from "../../templates";
import type { RenderContext } from "../../templates";
import { classNames, escapeHtml } from "../../templates/helpers";
import { renderPageShell, type BreadcrumbSegment } from "./pageShell";

const fileHeaderIcon = `<svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>`;

export const renderDocumentPage = (
  doc: NavDocumentEntry,
  navIndex: NavigationIndex,
  config: GeneratorConfig,
  stylesheetHref: string,
  additionalStylesheets: string[],
  resolveHref: (targetRelative: string) => string,
  resolveAssetHref: (assetPath: string) => string,
  getChartAssetHref: RenderContext["getChartAssetHref"],
): string => {
  const context: RenderContext = {
    styles: config.theme,
    basePath: config.basePath,
    currentPath: doc.id,
    resolveAssetHref,
    getChartAssetHref,
  };

  const contentHtml = renderBlocks(doc.content, context);

  const descriptionHtml = doc.description
    ? `<p class="${escapeHtml(
        classNames("text-gray-500 mb-6", config.theme.text.general ?? ""),
      )}">${escapeHtml(doc.description)}</p>`
    : "";

  const headerClasses = classNames(
    "flex flex-col gap-1 items-center py-2 mb-4",
    config.theme.sections.documentHeaderBackground ?? "",
  );
  const titleWrapperClass = classNames(
    "flex items-center gap-2",
    config.theme.text.documentTitle ?? "",
  );
  const paddingWrapperClass = "px-2 md:px-6";
  const contentContainerClass = "max-w-4xl mx-auto";

  const breadcrumbSegments: BreadcrumbSegment[] = [
    ...doc.ancestorCategoryIds
      .map((id) => navIndex.categories.get(id))
      .filter((category): category is NonNullable<typeof category> =>
        Boolean(category),
      )
      .map((category) => ({
        label: category.title,
        href: resolveHref(category.outputPathRelative),
      })),
    { label: doc.title },
  ];

  const breadcrumbHtml = breadcrumbSegments.length
    ? (() => {
        const listItems = breadcrumbSegments
          .map((segment, index) => {
            const isLast = index === breadcrumbSegments.length - 1;
            const content =
              segment.href && !isLast
                ? `<a class="hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-current rounded transition-colors" href="${escapeHtml(segment.href)}">${escapeHtml(segment.label)}</a>`
                : `<span class="${isLast ? "cursor-default" : "hover:underline"}">${escapeHtml(segment.label)}</span>`;
            const separator = isLast ? "" : `<span aria-hidden="true">/</span>`;
            return `<li class="flex items-center gap-2"${isLast ? ' aria-current="page"' : ""}>${content}${separator}</li>`;
          })
          .join("");
        const listClass = classNames(
          "flex flex-wrap items-center justify-center gap-2 text-sm",
          config.theme.text.breadcrumb ?? "",
        );
        return `<nav aria-label="Breadcrumb" class="flex justify-center">
          <ol class="${escapeHtml(listClass)}">${listItems}</ol>
        </nav>`;
      })()
    : "";

  const headerHtml = `<div class="${escapeHtml(headerClasses)}">
    <div class="${escapeHtml(titleWrapperClass)}">
      ${fileHeaderIcon}
      <h1 aria-label="${escapeHtml(doc.title)}">${escapeHtml(doc.title)}</h1>
    </div>
    ${breadcrumbHtml}
  </div>`;

  const bodyHtml = `<div class="${escapeHtml(paddingWrapperClass)}">
    <div class="${escapeHtml(contentContainerClass)}">
      ${descriptionHtml}
      <div class="space-y-4">${contentHtml}</div>
    </div>
  </div>`;

  const articleHtml = `<article>
    ${headerHtml}
    ${bodyHtml}
  </article>`;

  return renderPageShell({
    title: doc.title,
    mainContent: articleHtml,
    navIndex,
    config,
    stylesheetHref,
    additionalStylesheets,
    resolveHref,
    activeDocId: doc.id,
  });
};
