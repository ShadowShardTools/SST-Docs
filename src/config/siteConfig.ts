export type StyleTheme = {
  textStyles: Record<string, string>;
  componentsStyles: Record<string, string>;
  sectionStyles: Record<string, string>;
  chartsStyles: Record<string, string>;
};

export type SiteConfig = {
  logo: {
    image: string;
    text: string;
  };
  themes: {
    light: StyleTheme;
    dark: StyleTheme;
  };
};

export const siteConfig: SiteConfig = {
  logo: {
    image: "https://avatars.githubusercontent.com/u/107807003",
    text: "SST Docs - React JSON Documentation Template",
  },
  themes: {
    light: {
      textStyles: {
        logoText: "text-xl font-semibold text-gray-900",
        h1: "text-4xl font-bold text-stone-600 mb-6 mt-8 first:mt-0",
        h2: "text-2xl font-semibold text-gray-800 mb-4 mt-8 first:mt-0",
        h3: "text-xl font-medium text-gray-700 mb-3 mt-6 first:mt-0",
        general: "text-base text-gray-700 mb-4 leading-relaxed",
        list: "list-disc list-inside text-gray-700 mb-4 space-y-1",
        quote: "text-gray-700 italic",
        tableHeadersText: "font-semibold text-white text-lg",
        tableRowsText: "text-gray-700",
        imageAlt: "text-sm text-gray-400",
        code: "text-sm",
        math: "text-gray-800 text-lg",
        chartTitle: "text-lg text-gray-900",
        chartRegular: "text-sm text-gray-700",
        chartLegend: "text-xs text-gray-500",
        hints: "text-xs text-gray-500",
        scriptHeader: "text-blue-600 border-blue-500",
        scriptName: "text-sm text-gray-600",
        codeLanguage: "text-xs font-semibold text-stone-700 mt-1 text-right",

        searchModalItemHeaderText: "font-bold text-stone-600",
        searchModalItemFoundSectionText:
          "text-xs text-gray-500 mt-1 line-clamp-2",
        searchModalItemTags: "text-[11px] text-gray-400 mt-0.5 italic truncate",
      },
      componentsStyles: {
        input:
          "text-sm text-gray-700 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",

        button:
          "flex justify-center items-center gap-2 p-2 text-gray-700 font-bold bg-gray-100 rounded-md border transition-colors cursor-pointer border-gray-300 hover:bg-gray-200",
        buttonSmall:
          "text-xs flex justify-center items-center gap-2 py-1 px-2 text-gray-700 font-semibold bg-gray-100 rounded-md border transition-colors cursor-pointer border-gray-300 hover:bg-gray-200",

        dropdown:
          "bg-white border border-gray-300 rounded-md shadow-lg z-50 min-w-full max-h-60 overflow-y-auto",
        dropdownItem:
          "w-full text-left px-3 py-2 hover:bg-stone-200/50 transition-colors whitespace-nowrap cursor-pointer",
        dropdownItemActive: "border-l-2 text-stone-700 bg-stone-200 font-bold",

        navigationRowBase:
          "flex items-center gap-2 cursor-pointer px-2 py-1 focus:outline-none",
        navigationRowActive:
          "text-stone-700 font-semibold bg-stone-200 border-l-2 border-stone-500",
        navigationRowFocused: "ring-2 ring-stone-500",
        navigationRowHover: "hover:text-stone-500",

        searchBar: "border border-gray-300 rounded-md text-sm px-3 py-2",
        keyHints:
          "text-xs text-gray-500 border border-gray-300 rounded bg-white px-1.5 py-0.5 pointer-events-none",
        codeHeader:
          "flex items-center justify-between px-3 py-1.5 bg-stone-700/80 text-white border-b",
        tableBorder: "border-stone-400",
        quote: "border-l-4 border-stone-500 pl-4 py-2 mb-4 bg-stone-300",

        searchModalHeader: "bg-white",
        searchModalResultBackground: "bg-stone-100",
        searchModalFooter: "bg-white",
        searchModalBorders: "border-gray-800",
        searchModalItem: "hover:bg-stone-300/70",
        searchModalSelectedItem: "bg-stone-300 hover:bg-stone-300/70",
      },
      sectionStyles: {
        siteBackground: "bg-white text-gray-900",
        siteBorders: "border-x border-gray-200",
        headerBackground: "bg-white shadow-sm border-b border-gray-200",
        headerMobileBackground:
          "bg-white border-b border-gray-200 z-40 p-4 md:hidden shadow-md space-y-4",
        navigationBackground: "bg-white border-r border-gray-200",
        contentBackground: "bg-gray-50",
        tableHeadersBackground: "bg-stone-700/80",
        tableRowsBackground: "bg-stone-50",
      },
      chartsStyles: {
        legendLabelColor: "#1f2937", // text-gray-800
        tooltipBg: "#f9fafb", // gray-50
        tooltipTitleColor: "#111827", // gray-900
        tooltipBodyColor: "#1f2937", // gray-800
        tooltipBorderColor: "#d1d5db", // gray-300
        axisTickColor: "#4b5563", // gray-600
        gridLineColor: "rgba(0,0,0,0.05)",
      },
    },
    dark: {
      textStyles: {
        logoText: "text-xl font-semibold text-gray-50",
        h1: "text-4xl font-bold text-indigo-400 mb-6 mt-8 first:mt-0",
        h2: "text-2xl font-semibold text-gray-100 mb-4 mt-8 first:mt-0",
        h3: "text-xl font-medium text-gray-200 mb-3 mt-6 first:mt-0",
        general: "text-base text-gray-300 mb-4 leading-relaxed",
        list: "list-disc list-inside text-gray-300 mb-4 space-y-1",
        quote: "text-white italic",
        tableHeadersText: "font-semibold text-gray-200 text-lg",
        tableRowsText: "text-gray-200",
        imageAlt: "text-sm text-gray-500",
        code: "text-sm",
        math: "text-gray-200 text-lg",
        chartTitle: "text-lg text-white",
        chartRegular: "text-sm text-gray-300",
        chartLegend: "text-xs text-gray-400",
        hints: "text-xs text-gray-400",
        scriptHeader: "text-blue-400 border-blue-300",
        scriptName: "text-sm text-gray-400",
        codeLanguage: "text-xs font-semibold text-gray-400 mt-1 text-right",

        searchModalItemHeaderText: "font-bold text-indigo-400",
        searchModalItemFoundSectionText:
          "text-xs text-gray-300 mt-1 line-clamp-2",
        searchModalItemTags: "text-[11px] text-gray-500 mt-0.5 italic truncate",
      },
      componentsStyles: {
        input:
          "text-sm text-gray-400 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",

        button:
          "flex justify-center items-center gap-2 p-2 text-gray-100 font-bold bg-indigo-900/50 rounded-md border transition-colors cursor-pointer border-indigo-800 hover:bg-indigo-700/70",
        buttonSmall:
          "text-xs flex justify-center items-center gap-2 py-1 px-2 text-gray-100 font-semibold bg-indigo-800 rounded-md border transition-colors cursor-pointer border-indigo-600 hover:bg-indigo-700/70",

        dropdown:
          "bg-slate-800 border border-indigo-600 rounded-md shadow-lg z-50 min-w-full max-h-60 overflow-y-auto",
        dropdownItem:
          "text-white w-full text-left px-3 py-2 hover:bg-indigo-600/50 transition-colors whitespace-nowrap cursor-pointer",
        dropdownItemActive: "border-l-2 bg-indigo-900/60 font-bold",

        navigationRowBase:
          "text-gray-50 flex items-center gap-2 cursor-pointer px-2 py-1 focus:outline-none",
        navigationRowActive:
          "text-gray-50 font-semibold bg-indigo-900/60 border-l-2 border-blue-50",
        navigationRowFocused: "ring-2 ring-indigo-600",
        navigationRowHover: "hover:text-indigo-600",

        searchBar: "border border-gray-600 rounded-md text-sm px-3 py-2",
        keyHints:
          "text-xs text-gray-400 border border-gray-600 rounded px-1.5 py-0.5 pointer-events-none",
        codeHeader:
          "flex items-center justify-between px-3 py-1.5 bg-indigo-900/80 text-white border-b",
        tableBorder: "border-indigo-700",
        quote: "border-l-4 border-white pl-4 py-2 mb-4 bg-indigo-900/50",

        searchModalHeader: "bg-zinc-850 text-gray-400",
        searchModalResultBackground: "bg-zinc-900",
        searchModalFooter: "bg-zinc-850",
        searchModalBorders: "border-gray-500",
        searchModalItem: "hover:bg-indigo-900/80",
        searchModalSelectedItem: "bg-indigo-900/60 hover:bg-indigo-900/80",
      },
      sectionStyles: {
        siteBackground: "bg-zinc-900",
        siteBorders: "border-x border-gray-700",
        headerBackground: "bg-zinc-900 shadow-sm border-b border-gray-700",
        headerMobileBackground:
          "bg-zinc-900 border-b border-gray-200 z-40 p-4 md:hidden shadow-md space-y-4",
        navigationBackground: "bg-zinc-900 border-r border-gray-700",
        contentBackground: "bg-zinc-850",
        tableHeadersBackground: "bg-indigo-900/80",
        tableRowsBackground: "bg-indigo-950/5",
      },
      chartsStyles: {
        legendLabelColor: "#e5e7eb", // text-gray-200
        tooltipBg: "#1f2937", // gray-800
        tooltipTitleColor: "#facc15", // indigo-400
        tooltipBodyColor: "#f3f4f6", // gray-100
        tooltipBorderColor: "#4ade80", // green-400
        axisTickColor: "#e5e7eb", // gray-200
        gridLineColor: "rgba(255,255,255,0.1)",
      },
    },
  },
};
