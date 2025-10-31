import type { GeneratorConfig } from "../../types";
import type { NavigationIndex } from "./navigation";
import { classNames, escapeHtml } from "../../templates/helpers";
import { renderPageShell, type BreadcrumbSegment } from "./pageShell";

const renderCategorySummaries = (
  navIndex: NavigationIndex,
  theme: GeneratorConfig["theme"],
  resolveHref: (targetRelative: string) => string,
) =>
  navIndex.tree
    .map(
      (category) => `<a class="${escapeHtml(
        classNames(
          "block p-4 rounded-lg transition-colors border",
          theme.category.cardBody ?? "",
        ),
      )}" href="${escapeHtml(resolveHref(category.outputPathRelative))}">
        <h2 class="${escapeHtml(
          classNames(
            "text-lg font-semibold mb-1",
            theme.category.cardHeaderText ?? "",
          ),
        )}">${escapeHtml(category.title)}</h2>
        ${
          category.description
            ? `<p class="${escapeHtml(
                theme.category.cardDescriptionText ?? "text-sm text-gray-500",
              )}">${escapeHtml(category.description)}</p>`
            : ""
        }
      </a>`,
    )
    .join("");

const renderStandaloneList = (
  navIndex: NavigationIndex,
  theme: GeneratorConfig["theme"],
  resolveHref: (targetRelative: string) => string,
) =>
  navIndex.standaloneDocuments
    .map(
      (doc) =>
        `<li><a class="${escapeHtml(
          classNames(
            "block px-3 py-1.5 rounded transition-colors text-sm",
            theme.navigation.row ?? "",
            theme.navigation.rowHover ?? "",
          ),
        )}" href="${escapeHtml(resolveHref(doc.outputPathRelative))}">${escapeHtml(doc.title)}</a></li>`,
    )
    .join("");

export const renderVersionLanding = (
  config: GeneratorConfig,
  navIndex: NavigationIndex,
  stylesheetHref: string,
  additionalStylesheets: string[],
  resolveHref: (targetRelative: string) => string,
): string => {
  const categorySection = navIndex.tree.length
    ? `<section class="mb-8">
        <h1 class="${escapeHtml(
          classNames(
            "text-3xl font-bold mb-4",
            config.theme.text.documentTitle ?? "",
          ),
        )}">${escapeHtml(navIndex.versionLabel)}</h1>
        <p class="text-gray-600 mb-6">Browse documentation categories for this version.</p>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          ${renderCategorySummaries(navIndex, config.theme, resolveHref)}
        </div>
      </section>`
    : `<h1 class="${escapeHtml(
        classNames(
          "text-3xl font-bold mb-4",
          config.theme.text.documentTitle ?? "",
        ),
      )}">${escapeHtml(navIndex.versionLabel)}</h1>`;

  const standaloneSection =
    navIndex.standaloneDocuments.length > 0
      ? `<section>
          <h2 class="text-xl font-semibold mb-2">Standalone Documents</h2>
          <ul class="space-y-1">${renderStandaloneList(navIndex, config.theme, resolveHref)}</ul>
        </section>`
      : "";

  const mainContent = `<div class="px-2 md:px-6">
    <div class="max-w-4xl mx-auto space-y-8">
      ${categorySection}
      ${standaloneSection}
    </div>
  </div>`;

  const breadcrumb: BreadcrumbSegment[] = [{ label: navIndex.versionLabel }];

  return renderPageShell({
    title: navIndex.versionLabel,
    mainContent,
    navIndex,
    config,
    stylesheetHref,
    additionalStylesheets,
    resolveHref,
    breadcrumb,
  });
};
