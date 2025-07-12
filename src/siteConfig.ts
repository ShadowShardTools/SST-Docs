export type StyleTheme = {
  text: Record<string, string>;
  components: Record<string, string>;
  sections: Record<string, string>;
  charts: Record<string, string>;
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
    text: "SST Docs",
  },
  themes: {
    light: {
      text: {
        logoText: "text-xl font-semibold text-gray-900",
        titleLevel1: "text-4xl font-bold text-stone-600 mb-3 mt-8 first:mt-0",
        titleLevel2:
          "text-2xl font-semibold text-gray-800 mb-4 mt-8 first:mt-0",
        titleLevel3: "text-xl font-medium text-gray-700 mb-3 mt-6 first:mt-0",
        general: "text-base text-gray-700 mb-4 leading-relaxed",
        alternativeText: "text-sm text-gray-400 mt-2 text-center italic",
        list: "list-inside text-gray-700 mb-4 space-y-1",
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
      components: {
        input:
          "text-sm text-gray-700 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",

        button:
          "font-bold text-gray-700 bg-gray-100 border border-gray-300 rounded-md transition-colors hover:bg-gray-200",
        buttonSmall:
          "text-xs font-semibold text-gray-700 bg-gray-100 border border-gray-300 rounded-md transition-colors hover:bg-gray-200",
        buttonTabSmall:
          "text-xs font-semibold text-gray-300 bg-stone-700 border border-gray-300 rounded-md transition-colors hover:bg-gray-200",
        buttonTabSmallActive:
          "text-xs font-semibold text-gray-800 bg-lime-500 border border-lime-300 rounded-md transition-colors",

        dropdown: "bg-white border border-gray-300 rounded-md shadow-lg",
        dropdownItem:
          "text-left hover:bg-stone-200/50 transition-colors whitespace-nowrap",
        dropdownItemActive: "border-l-2 text-stone-700 bg-stone-200 font-bold",

        navigationRowBase: "focus:outline-none",
        navigationRowActive:
          "font-semibold text-stone-700 bg-stone-200 border-l-2 border-stone-500 transition-colors",
        navigationRowFocused: "ring-2 ring-stone-500",
        navigationRowHover: "hover:text-stone-500 transition-colors",

        keyHints:
          "text-xs text-gray-500 border border-gray-300 rounded bg-white",
        codeHeader: "bg-stone-700/80 text-white border-b",

        tableCorner: "bg-stone-900/80 font-bold text-white text-lg",
        tableHeaders: "bg-stone-700/80 font-semibold text-white text-lg",
        tableRows: "bg-stone-50 text-gray-700",
        tableBorder: "border-stone-400",

        searchModalHeader: "bg-white",
        searchModalResultBackground: "bg-stone-100",
        searchModalFooter: "bg-white",
        searchModalBorders: "border-gray-800",
        searchModalItem: "hover:bg-stone-300/70",
        searchModalSelectedItem: "bg-stone-300 hover:bg-stone-300/70",

        imageBorder: "border border-stone-500",
        imageCompareSlider: "oklch(92.2% 0 0)",

        audioContainer: "bg-gray-300",
        audioPlayButton:
          "bg-stone-700 hover:bg-stone-600 text-white transition-colors",
        audioTime: "text-gray-700 text-xs tabular-nums text-right",
        audioSlider: "bg-gray-700",
        audioSliderThumb:
          "[&::-webkit-slider-thumb]:bg-stone-600 [&::-moz-range-thumb]:bg-stone-600",

        messageInfo: "bg-blue-100 text-blue-800 border-blue-300",
        messageWarning: "bg-yellow-100 text-yellow-800 border-yellow-300",
        messageError: "bg-red-100 text-red-800 border-red-300",
        messageSuccess: "bg-green-100 text-green-800 border-green-300",
        messageNeutral: "bg-stone-100 text-gray-700 border-gray-300",
        messageQuote:
          "bg-stone-300 border-l-4 border-stone-500 text-gray-700 italic",
      },
      sections: {
        siteBackground: "bg-stone-400",
        siteBorders: "border-x border-stone-600",
        headerBackground: "bg-stone-50 shadow-sm border-b border-stone-400",
        headerMobileBackground:
          "bg-stone-50 border-b border-stone-400 shadow-md",
        navigationBackground: "bg-stone-50 border-r border-stone-400",
        contentBackground: "bg-gray-100",

        crossTableCornerCellBackground: "bg-stone-700",
      },
      charts: {
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
      text: {
        logoText: "text-xl font-semibold text-gray-50",
        titleLevel1: "text-4xl font-bold text-indigo-400 mb-3 mt-8 first:mt-0",
        titleLevel2:
          "text-2xl font-semibold text-gray-100 mb-4 mt-8 first:mt-0",
        titleLevel3: "text-xl font-medium text-gray-200 mb-3 mt-6 first:mt-0",
        general: "text-base text-gray-300 mb-4 leading-relaxed",
        alternativeText: "text-sm text-gray-400 mt-2 text-center italic",
        list: "list-inside text-gray-300 mb-4 space-y-1",
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
      components: {
        input:
          "text-sm text-gray-400 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",

        button:
          "font-bold text-gray-100 bg-indigo-900/50 border border-indigo-800 rounded-md transition-colors hover:bg-indigo-700/70",
        buttonSmall:
          "text-xs font-semibold text-gray-100 bg-indigo-900 border border-indigo-600 rounded-md transition-colors hover:bg-indigo-700/70",
        buttonTabSmall:
          "text-xs font-semibold text-indigo-300 bg-indigo-950 border border-indigo-600 rounded-md transition-colors hover:bg-indigo-700/70",
        buttonTabSmallActive:
          "text-xs font-semibold text-gray-800 bg-lime-500 border border-lime-300 rounded-md transition-colors",

        dropdown: "bg-slate-800 border border-indigo-600 rounded-md shadow-lg",
        dropdownItem:
          "text-white text-left hover:bg-indigo-600/50 transition-colors whitespace-nowrap",
        dropdownItemActive: "border-l-2 bg-indigo-900/60 font-bold",

        navigationRowBase: "text-gray-50 focus:outline-none",
        navigationRowActive:
          "font-semibold text-gray-50 bg-indigo-900/60 border-l-2 border-blue-50 transition-colors",
        navigationRowFocused: "ring-2 ring-indigo-600",
        navigationRowHover: "hover:text-indigo-600 transition-colors",

        keyHints: "text-xs text-gray-400 border border-gray-600 rounded",
        codeHeader: "bg-indigo-900/80 text-white border-b",

        tableCorner: "bg-indigo-900/50 font-bold text-gray-200 text-lg",
        tableHeaders: "bg-indigo-900/80 font-semibold text-gray-200 text-lg",
        tableRows: "bg-indigo-950/5 text-gray-200",
        tableBorder: "border-indigo-700",

        searchModalHeader: "bg-zinc-850 text-gray-400",
        searchModalResultBackground: "bg-zinc-900",
        searchModalFooter: "bg-zinc-850",
        searchModalBorders: "border-gray-500",
        searchModalItem: "hover:bg-indigo-900/80",
        searchModalSelectedItem: "bg-indigo-900/60 hover:bg-indigo-900/80",

        imageBorder: "border border-gray-700",
        imageCompareSlider: "oklch(89.4% 0.057 293.283)",

        audioContainer: "bg-indigo-900/50",
        audioPlayButton:
          "bg-indigo-700 hover:bg-indigo-600 text-white transition-colors",
        audioTime: "text-gray-400 text-xs tabular-nums text-right",
        audioSlider: "bg-gray-300",
        audioSliderThumb:
          "[&::-webkit-slider-thumb]:bg-indigo-600 [&::-moz-range-thumb]:bg-indigo-600",

        messageInfo: "bg-blue-900/40 text-blue-200 border-blue-400/60",
        messageWarning: "bg-yellow-900/40 text-yellow-200 border-yellow-400/60",
        messageError: "bg-red-900/40 text-red-200 border-red-400/60",
        messageSuccess: "bg-green-900/40 text-green-200 border-green-400/60",
        messageNeutral: "bg-indigo-300/20 text-gray-200 border-gray-500",
        messageQuote:
          "bg-indigo-900/50 border-l-4 border-white text-white italic",
      },
      sections: {
        siteBackground: "bg-slate-950",
        siteBorders: "border-x border-gray-700",
        headerBackground: "bg-zinc-900 shadow-sm border-b border-gray-700",
        headerMobileBackground:
          "bg-zinc-900 border-b border-gray-200 shadow-md",
        navigationBackground: "bg-zinc-900 border-r border-gray-700",
        contentBackground: "bg-zinc-850",

        crossTableCornerCellBackground: "bg-indigo-950",
      },
      charts: {
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
