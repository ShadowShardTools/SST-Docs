import type { GeneratorConfig } from "../../types";
import type {
  NavigationIndex,
  NavCategoryEntry,
  NavDocumentEntry,
} from "./navigation";
import { escapeHtml, classNames } from "../../templates/helpers";
import { stylesConfig } from "../../../../configs/site-config";

const NAVIGATION_SCRIPT = `<script>
(function () {
  if (typeof document === "undefined") return;
  var body = document.body;
  var storageKey = body ? body.getAttribute("data-nav-storage-key") : null;
  var storedExpandedIds = [];
  if (storageKey) {
    try {
      var storedRaw = window.localStorage.getItem(storageKey);
      if (storedRaw) {
        var parsed = JSON.parse(storedRaw);
        if (Array.isArray(parsed)) {
          storedExpandedIds = parsed.filter(function (id) {
            return typeof id === "string" && id.length > 0;
          });
        }
      }
    } catch (_error) {
      storedExpandedIds = [];
    }
  }
  var updateToggleIcons = function (toggle, attr, open) {
    if (!toggle) return;
    toggle.querySelectorAll("[" + attr + "]").forEach(function (icon) {
      var state = icon.getAttribute(attr);
      if (!state) return;
      if (state === "open") {
        icon.style.display = open ? "" : "none";
      } else if (state === "closed") {
        icon.style.display = open ? "none" : "";
      }
    });
  };
  var setPanelState = function (panel, toggle, open, attr) {
    if (panel) {
      panel.hidden = !open;
    }
    if (toggle) {
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      updateToggleIcons(toggle, attr, open);
    }
  };
  var mobileNavToggle = document.querySelector("[data-mobile-nav-toggle]");
  var mobileNavPanel = document.querySelector("[data-mobile-nav-panel]");
  var mobileNavScrim = document.querySelector("[data-mobile-nav-scrim]");
  var mobileMenuToggle = document.querySelector("[data-mobile-menu-toggle]");
  var mobileMenuPanel = document.querySelector("[data-mobile-menu-panel]");
  var setMobileNavState = function (open) {
    setPanelState(mobileNavPanel, mobileNavToggle, open, "data-mobile-nav-icon");
    if (mobileNavScrim) {
      mobileNavScrim.hidden = !open;
    }
    if (body) {
      body.style.overflow = open ? "hidden" : "";
    }
  };
  var setMobileMenuState = function (open) {
    setPanelState(mobileMenuPanel, mobileMenuToggle, open, "data-mobile-menu-icon");
  };
  setMobileNavState(false);
  setMobileMenuState(false);
  if (mobileNavToggle) {
    mobileNavToggle.addEventListener("click", function (event) {
      event.preventDefault();
      var isOpen = mobileNavToggle.getAttribute("aria-expanded") === "true";
      setMobileMenuState(false);
      setMobileNavState(!isOpen);
    });
  }
  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener("click", function (event) {
      event.preventDefault();
      var isOpen = mobileMenuToggle.getAttribute("aria-expanded") === "true";
      setMobileNavState(false);
      setMobileMenuState(!isOpen);
    });
  }
  if (mobileNavPanel) {
    mobileNavPanel.addEventListener("click", function (event) {
      var target = event.target;
      var link = target && target.closest ? target.closest("a") : null;
      if (link) {
        setMobileNavState(false);
        setMobileMenuState(false);
      }
    });
  }
  if (mobileNavScrim) {
    mobileNavScrim.addEventListener("click", function (event) {
      event.preventDefault();
      setMobileNavState(false);
    });
  }
  if (mobileMenuPanel) {
    mobileMenuPanel.addEventListener("click", function (event) {
      var target = event.target;
      var link = target && target.closest ? target.closest("a") : null;
      if (link) {
        setMobileMenuState(false);
      }
    });
  }
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" || event.key === "Esc") {
      setMobileNavState(false);
      setMobileMenuState(false);
    }
  });
  var containers = new Map();
  document.querySelectorAll("[data-category-children]").forEach(function (section) {
    var id = section.getAttribute("data-category-children");
    if (!id) return;
    var list = containers.get(id);
    if (!list) {
      list = [];
      containers.set(id, list);
    }
    list.push(section);
  });
  var toggles = new Map();
  document.querySelectorAll("[data-category-toggle]").forEach(function (button) {
    var id = button.getAttribute("data-category-toggle");
    if (!id) return;
    var list = toggles.get(id);
    if (!list) {
      list = [];
      toggles.set(id, list);
    }
    list.push(button);
  });
  var carets = new Map();
  document.querySelectorAll("[data-category-caret]").forEach(function (icon) {
    var id = icon.getAttribute("data-category-caret");
    if (!id) return;
    var list = carets.get(id);
    if (!list) {
      list = [];
      carets.set(id, list);
    }
    list.push(icon);
  });
  var initialExpanded = new Set(storedExpandedIds);
  document.querySelectorAll("[data-category-toggle]").forEach(function (button) {
    if (button.getAttribute("aria-expanded") === "true") {
      var id = button.getAttribute("data-category-toggle");
      if (id) initialExpanded.add(id);
    }
  });
  var setExpanded = function (id, expanded) {
    var sections = containers.get(id);
    if (sections) {
      sections.forEach(function (section) {
        section.style.display = expanded ? "" : "none";
      });
    }
    var buttons = toggles.get(id);
    if (buttons) {
      buttons.forEach(function (button) {
        button.setAttribute("aria-expanded", expanded ? "true" : "false");
      });
    }
    var icons = carets.get(id);
    if (icons) {
      icons.forEach(function (icon) {
        icon.style.transform = expanded ? "" : "rotate(-90deg)";
      });
    }
  };
  var persistState = function () {
    if (!storageKey) return;
    try {
      var openIds = [];
      containers.forEach(function (_sections, id) {
        var buttons = toggles.get(id);
        var isOpen = false;
        if (buttons && buttons.length > 0) {
          isOpen = buttons.some(function (button) {
            return button.getAttribute("aria-expanded") === "true";
          });
        } else {
          var sections = containers.get(id);
          if (sections && sections.length > 0) {
            isOpen = sections.some(function (section) {
              return section.style.display !== "none";
            });
          }
        }
        if (isOpen) openIds.push(id);
      });
      window.localStorage.setItem(storageKey, JSON.stringify(openIds));
    } catch (_error) {
      /* ignore storage errors */
    }
  };
  initialExpanded.forEach(function (id) {
    setExpanded(id, true);
  });
  document.querySelectorAll("[data-category-toggle]").forEach(function (button) {
    button.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation(); // Prevent propagation to parent elements
      var id = button.getAttribute("data-category-toggle");
      if (!id) return;
      var expanded = button.getAttribute("aria-expanded") === "true";
      setExpanded(id, !expanded);
      persistState();
    });
  });
  document.querySelectorAll("[data-category-link]").forEach(function (link) {
    link.addEventListener("click", function (event) {
      var id = link.getAttribute("data-category-link");
      if (!id) return;
      var sections = containers.get(id);
      if (!sections || sections.length === 0) return;
      var isOpen = sections.some(function (section) {
        return section.style.display !== "none";
      });
      // Only prevent default and expand if closed - don't toggle
      if (!isOpen) {
        event.preventDefault();
        setExpanded(id, true);
        persistState();
        return;
      }
      // If already open, allow normal navigation without changing state
    });
  });
})();
</script>`;

export interface BreadcrumbSegment {
  label: string;
  href?: string;
}

export interface PageShellOptions {
  title: string;
  mainContent: string;
  navIndex: NavigationIndex;
  config: GeneratorConfig;
  stylesheetHref: string;
  additionalStylesheets?: string[];
  resolveHref: (targetRelative: string) => string;
  breadcrumb?: BreadcrumbSegment[];
  activeDocId?: string;
  activeCategoryId?: string;
}

const svgIcon = (paths: string[], viewBox = "0 0 24 24") =>
  `<svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="${viewBox}">${paths
    .map((d) => `<path d="${d}" />`)
    .join("")}</svg>`;

const folderIcon = svgIcon([
  "M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z",
]);

const fileTextIcon = svgIcon([
  "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",
  "M14 2v4a2 2 0 0 0 2 2h4",
  "M10 9H8",
  "M16 13H8",
  "M16 17H8",
]);

const caretDownIcon = svgIcon(["m6 9 6 6 6-6"]);
const listIcon = svgIcon([
  "M8 6h13",
  "M8 12h13",
  "M8 18h13",
  "M3 6h.01",
  "M3 12h.01",
  "M3 18h.01",
]);
const menuIcon = svgIcon(["M4 6h16", "M4 12h16", "M4 18h16"]);
const closeIcon = svgIcon(["M6 6l12 12", "M18 6 6 18"]);
const githubIcon = `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>`;

const renderDocLink = (
  doc: NavDocumentEntry,
  theme: GeneratorConfig["theme"],
  isActive: boolean,
  resolveHref: (targetRelative: string) => string,
  depth = 0,
) => {
  const depthClass = depth > 0 ? "text-sm" : "text-base";
  const linkClass = classNames(
    "flex items-center gap-2 px-2 py-1 cursor-pointer transition-colors",
    depthClass,
    theme.navigation.row ?? "",
    isActive ? (theme.navigation.rowActive ?? "") : "",
    isActive ? "" : (theme.navigation.rowHover ?? ""),
  );

  const href = resolveHref(doc.outputPathRelative);

  return `<a class="${escapeHtml(linkClass)}" href="${escapeHtml(href)}">
    <span class="shrink-0">${fileTextIcon}</span>
    <span class="truncate">${escapeHtml(doc.title)}</span>
  </a>`;
};

const renderCategoryNode = (
  category: NavCategoryEntry,
  navIndex: NavigationIndex,
  theme: GeneratorConfig["theme"],
  resolveHref: (targetRelative: string) => string,
  opts: {
    activeCategoryId?: string;
    activeDocId?: string;
    expandedCategoryIds: Set<string>;
  },
  depth = 0,
): string => {
  const expanded = opts.expandedCategoryIds.has(category.id);
  const isActiveCategory = category.id === opts.activeCategoryId;
  const containerClass = classNames("space-y-1", depth > 0 ? "ml-4" : "");
  const depthClass = depth > 0 ? "text-sm" : "text-base";
  const headerClass = classNames(
    "flex items-center justify-between px-2 py-1 cursor-pointer transition-colors gap-2",
    depthClass,
    theme.navigation.row ?? "",
    isActiveCategory ? (theme.navigation.rowActive ?? "") : "",
    isActiveCategory ? "" : (theme.navigation.rowHover ?? ""),
  );

  const docItems = category.docs
    .map((docId) => {
      const doc = navIndex.documents.get(docId);
      if (!doc) return "";
      const isActive = doc.id === opts.activeDocId;
      return `<li>${renderDocLink(doc, theme, isActive, resolveHref, depth + 1)}</li>`;
    })
    .join("");

  const childCategories = category.childCategories
    .map((childId) => {
      const child = navIndex.categories.get(childId);
      if (!child) return "";
      return renderCategoryNode(
        child,
        navIndex,
        theme,
        resolveHref,
        opts,
        depth + 1,
      );
    })
    .join("");

  const docList = docItems ? `<ul class="ml-5 space-y-1">${docItems}</ul>` : "";
  const childCategoryList = childCategories
    ? `<ul class="space-y-1">${childCategories}</ul>`
    : "";
  const hasNestedContent = Boolean(docList || childCategoryList);

  const href = resolveHref(category.outputPathRelative);
  const linkDataAttr = hasNestedContent
    ? ` data-category-link="${escapeHtml(category.id)}"`
    : "";
  const toggleButton = hasNestedContent
    ? `<button type="button" class="shrink-0 p-1 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-400 text-gray-500 hover:text-gray-700 transition" data-category-toggle="${escapeHtml(
        category.id,
      )}" aria-label="Toggle ${escapeHtml(category.title)}" aria-expanded="${expanded ? "true" : "false"}">
        <span class="block transition-transform" data-category-caret="${escapeHtml(category.id)}"${
          expanded ? "" : ' style="transform: rotate(-90deg);"'
        }>
          ${caretDownIcon}
        </span>
      </button>`
    : "";

  const nestedContent = hasNestedContent
    ? `<div class="space-y-2" data-category-children="${escapeHtml(
        category.id,
      )}"${expanded ? "" : ' style="display:none;"'}>
        ${docList}${childCategoryList}
      </div>`
    : "";

  return `<li class="${escapeHtml(containerClass)}">
    <div class="${escapeHtml(headerClass)}">
      <a class="flex items-center gap-2 flex-1" href="${escapeHtml(
        href,
      )}"${linkDataAttr}>
        <span class="shrink-0">${folderIcon}</span>
        <span class="truncate">${escapeHtml(category.title)}</span>
      </a>
      ${toggleButton}
    </div>
    ${nestedContent}
  </li>`;
};

const buildNavigationContent = (
  navIndex: NavigationIndex,
  config: GeneratorConfig,
  resolveHref: (targetRelative: string) => string,
  opts: { activeDocId?: string; activeCategoryId?: string },
  expandedCategoryIds: Set<string>,
) => {
  const theme = config.theme;

  const standaloneItems = navIndex.standaloneDocuments
    .map(
      (doc) =>
        `<li>${renderDocLink(doc, theme, doc.id === opts.activeDocId, resolveHref)}</li>`,
    )
    .join("");

  const standaloneSection =
    standaloneItems.length > 0
      ? `<section class="space-y-2">
          <h2 class="text-xs uppercase tracking-wide text-gray-500">Standalone</h2>
          <ul class="space-y-1">${standaloneItems}</ul>
        </section>`
      : "";

  const categoryList = navIndex.tree
    .map((category) =>
      renderCategoryNode(category, navIndex, theme, resolveHref, {
        activeCategoryId: opts.activeCategoryId,
        activeDocId: opts.activeDocId,
        expandedCategoryIds,
      }),
    )
    .join("");

  return `<div class="space-y-4">
    ${standaloneSection}
    <nav aria-label="Sidebar navigation">
      <ul class="space-y-1">${categoryList}</ul>
    </nav>
  </div>`;
};

const computeExpandedCategoryIds = (
  navIndex: NavigationIndex,
  opts: { activeDocId?: string; activeCategoryId?: string },
) => {
  const expanded = new Set<string>();
  if (opts.activeDocId) {
    const activeDoc = navIndex.documents.get(opts.activeDocId);
    if (activeDoc) {
      if (activeDoc.parentCategoryId) {
        expanded.add(activeDoc.parentCategoryId);
      }
      activeDoc.ancestorCategoryIds.forEach((id) => expanded.add(id));
    }
  }
  if (opts.activeCategoryId) {
    const activeCategory = navIndex.categories.get(opts.activeCategoryId);
    if (activeCategory) {
      expanded.add(activeCategory.id);
      activeCategory.ancestorCategoryIds.forEach((id) => expanded.add(id));
    }
  }
  return expanded;
};

const renderNavigationLayouts = (
  navIndex: NavigationIndex,
  config: GeneratorConfig,
  resolveHref: (targetRelative: string) => string,
  opts: { activeDocId?: string; activeCategoryId?: string },
) => {
  const theme = config.theme;
  const expandedCategoryIds = computeExpandedCategoryIds(navIndex, opts);
  const content = buildNavigationContent(
    navIndex,
    config,
    resolveHref,
    opts,
    expandedCategoryIds,
  );

  const desktopClass = classNames(
    "hidden md:block fixed md:sticky top-16 bottom-0 md:top-16 md:h-[calc(100vh-4rem)] w-64 shrink-0 p-4 overflow-y-auto custom-scrollbar z-40 transition-colors",
    theme.sections.sidebarBackground ?? "",
  );

  const mobileClass = classNames(
    "md:hidden fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto custom-scrollbar transition-colors shadow-lg",
    theme.sections.sidebarBackground ?? "",
  );

  const mobileInnerClass = classNames("h-full px-4 py-4 space-y-4");

  const desktop = `<aside class="${escapeHtml(desktopClass)}">${content}</aside>`;

  const mobile = `<aside id="mobile-navigation" class="${escapeHtml(mobileClass)}" data-mobile-nav-panel hidden>
    <div class="${escapeHtml(mobileInnerClass)}">${content}</div>
  </aside>`;

  const mobileScrim = `<div class="md:hidden fixed inset-x-0 top-16 bottom-0 bg-black/40 backdrop-blur-sm z-30" data-mobile-nav-scrim hidden></div>`;

  return { desktop, mobile, scrim: mobileScrim };
};

export const renderBreadcrumbTrail = (
  segments: BreadcrumbSegment[],
  theme: GeneratorConfig["theme"],
) => {
  if (!segments.length) return "";
  const items = segments
    .map((segment, index) => {
      const isLast = index === segments.length - 1;
      const content =
        segment.href && !isLast
          ? `<a class="hover:underline" href="${escapeHtml(segment.href)}">${escapeHtml(segment.label)}</a>`
          : `<span>${escapeHtml(segment.label)}</span>`;
      const itemClass = classNames(
        theme.text.breadcrumb ?? "",
        "flex items-center gap-2",
      );
      const separator = isLast ? "" : `<span aria-hidden="true">/</span>`;
      return `<li class="${escapeHtml(itemClass)}"${isLast ? ' aria-current="page"' : ""}>${content}${separator}</li>`;
    })
    .join("");

  return `<nav aria-label="Breadcrumb" class="mb-4">
    <ol class="flex flex-wrap gap-2 text-sm">${items}</ol>
  </nav>`;
};

const renderHeader = (
  navIndex: NavigationIndex,
  theme: GeneratorConfig["theme"],
) => {
  const logoImage = stylesConfig.logo?.image
    ? `<img src="${escapeHtml(stylesConfig.logo.image)}" alt="${escapeHtml(stylesConfig.logo?.text ?? "Logo")}" class="h-8 w-auto rounded-full pointer-events-none select-none" />`
    : "";
  const logoText = stylesConfig.logo?.text || navIndex.versionLabel;
  const logoClass = theme.text.logoText ?? "text-lg font-semibold";

  const navToggleClass = classNames(
    "md:hidden inline-flex items-center justify-center p-2",
    theme.header?.mobileNavigationToggle ?? "",
  );
  const menuToggleClass = classNames(
    "md:hidden inline-flex items-center justify-center p-2",
    theme.header?.mobileMenuToggle ?? "",
  );

  const githubDesktopButtonClass = classNames(
    "hidden md:inline-flex items-center gap-2 px-3 py-1.5 text-sm w-auto",
    theme.buttons?.common ?? "border border-gray-300 rounded",
  );

  const githubMobileButtonClass = classNames(
    "inline-flex items-center justify-center gap-2 px-3 py-1.5 text-sm w-full",
    theme.buttons?.common ?? "border border-gray-300 rounded",
  );

  const mobileMenuPanelClass = classNames(
    "md:hidden border-t p-4 space-y-3",
    theme.sections.headerBackground ?? "",
  );

  const mobileMenuPanel = `<div id="mobile-header-menu" class="${escapeHtml(mobileMenuPanelClass)}" data-mobile-menu-panel hidden>
    <div class="pt-3 flex flex-col gap-3">
      <a class="${escapeHtml(githubMobileButtonClass)}" href="https://github.com/ShadowShardTools/SST-Docs" target="_blank" rel="noopener noreferrer">
        ${githubIcon}
        <span>GitHub</span>
      </a>
    </div>
  </div>`;

  return `<header class="${escapeHtml(classNames("sticky top-0 z-50 w-full transition-colors", theme.sections.headerBackground ?? ""))}">
    <div class="flex items-center justify-between h-16 px-4 md:px-6">
      <div class="md:hidden">
        <button type="button" class="${escapeHtml(navToggleClass)}" data-mobile-nav-toggle aria-expanded="false" aria-controls="mobile-navigation">
          <span data-mobile-nav-icon="closed">${listIcon}</span>
          <span data-mobile-nav-icon="open" style="display:none;">${closeIcon}</span>
        </button>
      </div>
      <div class="flex-1 flex items-center justify-center md:justify-start gap-2 select-none">
        ${logoImage}
        <span class="${escapeHtml(logoClass)}">${escapeHtml(logoText)}</span>
      </div>
      <div class="md:hidden">
        <button type="button" class="${escapeHtml(menuToggleClass)}" data-mobile-menu-toggle aria-expanded="false" aria-controls="mobile-header-menu">
          <span data-mobile-menu-icon="closed">${menuIcon}</span>
          <span data-mobile-menu-icon="open" style="display:none;">${closeIcon}</span>
        </button>
      </div>
      <a class="${escapeHtml(githubDesktopButtonClass)}" href="https://github.com/ShadowShardTools/SST-Docs" target="_blank" rel="noopener noreferrer">
        ${githubIcon}
        <span>GitHub</span>
      </a>
    </div>
    ${mobileMenuPanel}
  </header>`;
};

export const renderPageShell = (options: PageShellOptions) => {
  const {
    title,
    mainContent,
    navIndex,
    config,
    stylesheetHref,
    additionalStylesheets = [],
    resolveHref,
    breadcrumb,
    activeDocId,
    activeCategoryId,
  } = options;
  const theme = config.theme;
  const transitionClass = "transition-colors";
  const navigation = renderNavigationLayouts(navIndex, config, resolveHref, {
    activeDocId,
    activeCategoryId,
  });

  const breadcrumbHtml = breadcrumb
    ? renderBreadcrumbTrail(breadcrumb, theme)
    : "";

  const siteBackground = theme.sections.siteBackground ?? "";
  const contentBackground = theme.sections.contentBackground ?? "";
  const siteBorders = theme.sections.siteBorders ?? "";

  const headerHtml = renderHeader(navIndex, theme);
  const bodyClass = classNames("min-h-screen", transitionClass);
  const outerShellClass = classNames(siteBackground, transitionClass);
  const borderedShellClass = classNames(siteBorders);
  const contentWrapperClass = classNames(
    "flex-1 overflow-x-auto",
    contentBackground,
    transitionClass,
  );
  const contentInnerClass = "w-full";

  const extraStylesHtml = additionalStylesheets
    .map((href) => `<link rel="stylesheet" href="${escapeHtml(href)}" />`)
    .join("\n    ");
  const extraStylesBlock = extraStylesHtml ? `\n    ${extraStylesHtml}` : "";
  const storageKey = `sst-docs-nav-${navIndex.versionId}`;
  const bodyAttributes = `class="${escapeHtml(bodyClass)}" data-nav-storage-key="${escapeHtml(storageKey)}"`;

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)} | ${escapeHtml(navIndex.versionLabel)}</title>
    <link rel="stylesheet" href="${escapeHtml(stylesheetHref)}" />${extraStylesBlock}
  </head>
  <body ${bodyAttributes}>
    <div class="${escapeHtml(outerShellClass)}">
      <div class="min-h-screen max-w-7xl mx-auto px-0 md:px-6 lg:px-8">
        <div class="${escapeHtml(borderedShellClass)}">
          <div class="flex flex-col min-h-screen">
            ${headerHtml}
            ${navigation.scrim ?? ""}
            ${navigation.mobile}
            <main class="flex flex-1">
              ${navigation.desktop}
              <div class="${escapeHtml(contentWrapperClass)}">
                <div class="${escapeHtml(contentInnerClass)}">
                  ${breadcrumbHtml}
                  ${mainContent}
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
    ${NAVIGATION_SCRIPT}
  </body>
</html>`;
};
