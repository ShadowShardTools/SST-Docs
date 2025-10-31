import type { GeneratorConfig } from "../../types";
import type { NavigationIndex, NavCategoryEntry } from "./navigation";
import { renderBlocks, type RenderContext } from "../../templates";
import { classNames, escapeHtml } from "../../templates/helpers";
import { renderPageShell, type BreadcrumbSegment } from "./pageShell";

const folderHeaderIcon = `<svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" viewBox="0 0 24 24"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>`;
const folderCardIcon = `<svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" viewBox="0 0 24 24"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>`;
const fileCardIcon = `<svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" viewBox="0 0 24 24"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>`;

const renderCards = (
  category: NavCategoryEntry,
  navIndex: NavigationIndex,
  theme: GeneratorConfig["theme"],
  resolveHref: (targetRelative: string) => string,
) => {
  const docCards = category.docs
    .map((docId) => navIndex.documents.get(docId))
    .filter((doc): doc is NonNullable<typeof doc> => Boolean(doc))
    .map(
      (doc) => `<a class="${escapeHtml(
        classNames(
          "block p-4 rounded-lg transition-colors border",
          theme.category.cardBody ?? "",
        ),
      )}" href="${escapeHtml(resolveHref(doc.outputPathRelative))}">
        <div class="${escapeHtml(
          classNames(
            "flex items-center gap-2 mb-2",
            theme.category.cardHeaderText ?? "",
          ),
        )}">
          <span class="shrink-0">${fileCardIcon}</span>
          <span class="font-semibold">${escapeHtml(doc.title)}</span>
        </div>
        ${
          doc.description
            ? `<p class="${escapeHtml(
                theme.category.cardDescriptionText ?? "text-sm text-gray-500",
              )}">${escapeHtml(doc.description)}</p>`
            : ""
        }
      </a>`,
    )
    .join("");

  const childCards = category.childCategories
    .map((childId) => navIndex.categories.get(childId))
    .filter((child): child is NonNullable<typeof child> => Boolean(child))
    .map(
      (child) => `<a class="${escapeHtml(
        classNames(
          "block p-4 rounded-lg transition-colors border",
          theme.category.cardBody ?? "",
        ),
      )}" href="${escapeHtml(resolveHref(child.outputPathRelative))}">
        <div class="${escapeHtml(
          classNames(
            "flex items-center gap-2 mb-2",
            theme.category.cardHeaderText ?? "",
          ),
        )}">
          <span class="shrink-0">${folderCardIcon}</span>
          <span class="font-semibold">${escapeHtml(child.title)}</span>
        </div>
        ${
          child.description
            ? `<p class="${escapeHtml(
                theme.category.cardDescriptionText ?? "text-sm text-gray-500",
              )}">${escapeHtml(child.description)}</p>`
            : ""
        }
      </a>`,
    )
    .join("");

  const combined = [childCards, docCards].filter(Boolean).join("");
  if (!combined) {
    return `<p class="${escapeHtml(
      theme.category.empty ?? "text-sm text-gray-500",
    )}">This category is empty.</p>`;
  }

  return `<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">${combined}</div>`;
};

export const renderCategoryPage = (
  category: NavCategoryEntry,
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
    currentPath: category.id,
    resolveAssetHref,
    getChartAssetHref,
  };

  const contentHtml = category.content?.length
    ? `<div class="space-y-4 mb-8">${renderBlocks(category.content ?? [], context)}</div>`
    : "";

  const cardsHtml = renderCards(category, navIndex, config.theme, resolveHref);

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
    ...category.ancestorCategoryIds
      .map((id) => navIndex.categories.get(id))
      .filter((parent): parent is NonNullable<typeof parent> => Boolean(parent))
      .map((parent) => ({
        label: parent.title,
        href: resolveHref(parent.outputPathRelative),
      })),
    { label: category.title },
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
      ${folderHeaderIcon}
      <h1 aria-label="${escapeHtml(category.title)}">${escapeHtml(category.title)}</h1>
    </div>
    ${breadcrumbHtml}
  </div>`;

  const bodyContent = [contentHtml, cardsHtml].filter(Boolean).join("");

  const bodyHtml = bodyContent
    ? `<div class="${escapeHtml(paddingWrapperClass)}">
        <div class="${escapeHtml(contentContainerClass)}">
          ${bodyContent}
        </div>
      </div>`
    : "";

  const articleHtml = `<article>
    ${headerHtml}
    ${bodyHtml}
  </article>`;

  return renderPageShell({
    title: category.title,
    mainContent: articleHtml,
    navIndex,
    config,
    stylesheetHref,
    additionalStylesheets,
    resolveHref,
    activeCategoryId: category.id,
  });
};
