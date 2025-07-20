import type { StyleTheme } from "../types/entities/StyleTheme";

export const lightTheme: StyleTheme = {
  input:
    "text-sm text-stone-700 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
  text: {
    logoText: "text-xl font-semibold text-gray-900",
    titleLevel1: "text-4xl font-bold text-stone-600 mb-3 mt-8 first:mt-0",
    titleLevel2: "text-2xl font-semibold text-gray-800 mb-4 mt-8 first:mt-0",
    titleLevel3: "text-xl font-medium text-gray-700 mb-3 mt-6 first:mt-0",
    titleAnchor: "text-stone-400 hover:text-blue-500",
    breadcrumb: "text-sm text-stone-500",
    general: "text-base text-gray-700 mb-2 leading-relaxed",
    alternative: "text-sm text-gray-400 mt-2 text-center italic",
    list: "list-inside text-gray-700 mb-2 space-y-1",
    math: "text-gray-800 text-lg",
  },
  hints: {
    text: "text-xs text-stone-500",
    key: "text-xs text-stone-500 border border-stone-300 rounded bg-white",
  },
  divider: {
    border: "border-stone-400",
    gradient: "from-transparent via-stone-400 to-transparent",
    text: "text-stone-400 text-sm",
  },
  buttons: {
    common:
      "font-bold text-stone-700 bg-stone-100 border border-stone-300 rounded-md transition-colors hover:bg-stone-200",
    small:
      "text-xs font-semibold text-stone-700 bg-stone-100 border border-stone-300 rounded-md transition-colors hover:bg-stone-200",
    tabSmall:
      "text-xs font-semibold text-stone-300 bg-stone-700 border border-stone-300 rounded-md transition-colors hover:bg-stone-200",
    tabSmallActive:
      "text-xs font-semibold text-stone-800 bg-lime-500 border border-lime-300 rounded-md transition-colors",
  },
  dropdown: {
    container: "bg-white border border-stone-300 rounded-md shadow-lg",
    item: "text-left hover:bg-stone-200/50 transition-colors whitespace-nowrap",
    itemActive: "border-l-2 'text-stone-700' bg-stone-200 font-bold",
  },
  messageBox: {
    info: "bg-blue-100 text-blue-800 border-blue-300",
    warning: "bg-yellow-100 text-yellow-800 border-yellow-300",
    error: "bg-red-100 text-red-800 border-red-300",
    success: "bg-green-100 text-green-800 border-green-300",
    neutral: "bg-stone-100 text-gray-700 border-gray-300",
    quote: "bg-stone-300 border-l-4 border-stone-500 text-gray-700 italic",
  },
  table: {
    cornerCell: "bg-stone-900/80 font-bold text-white text-lg",
    headers: "bg-stone-700/80 font-semibold text-white text-lg",
    rows: "bg-stone-50 text-gray-700",
    border: "border-stone-400",
    empty: "text-gray-500 text-center",
  },
  code: {
    header: "bg-stone-700/80 text-gray-200 border-b border-stone-300",
    language: "text-xs font-semibold text-stone-300 mt-1 text-right",
    lines: "text-sm text-gray-500 border-r border-gray-300",
    empty: "bg-gray-50 text-gray-500 text-center text-sm border"
  },
  audioPlayer: {
    container: "bg-gray-300",
    playButton: "bg-stone-700 hover:bg-stone-600 text-white transition-colors",
    time: "text-gray-700 text-xs tabular-nums text-right",
    slider: "bg-gray-700",
    sliderThumb:
      "[&::-webkit-slider-thumb]:bg-stone-600 [&::-moz-range-thumb]:bg-stone-600",
  },
  chart: {
    legendLabelColor: "#1f2937",
    tooltipBg: "#f9fafb",
    tooltipTitleColor: "#111827",
    tooltipBodyColor: "#1f2937",
    tooltipBorderColor: "#d1d5db",
    axisTickColor: "#4b5563",
    gridLineColor: "rgba(0,0,0,0.05)",
  },
  header: {
    mobileNavigationToggle: "text-stone-500 hover:text-stone-700",
    mobileMenuToggle: "text-stone-500 hover:text-stone-700",
  },
  category: {
    empty: "text-gray-500 text-center",
    cardBody: "bg-gray-200 border border-gray-300 rounded-xl text-left transition-colors hover:bg-stone-300",
    cardHeaderText: "text-stone-700 text-lg font-semibold mb-1",
    cardDescriptionText: "text-sm text-gray-600 line-clamp-3",
  },
  navigation: {
    row: "focus:outline-none",
    rowActive:
      "font-semibold text-stone-700 bg-stone-200 border-l-2 border-stone-500 transition-colors",
    rowFocused: "ring-2 ring-stone-500",
    rowHover: "hover:text-stone-500 transition-colors",
    hideOrShowHintsText: "text-stone-600 hover:underline focus:outline-none",
  },
  searchModal: {
    resultBackground: "bg-stone-100",
    resultEmptyInputText: "text-gray-400 text-sm text-center",
    resultNoResultText: "text-gray-400 text-sm text-center",

    header: "bg-white",
    footer: "bg-white",
    borders: "border-gray-800",

    item: "hover:bg-stone-300/70 border-b border-stone-300",
    selectedItem:
      "bg-stone-300 hover:bg-stone-300/70 border-b border-stone-300",
    itemHeaderText: "font-bold text-stone-600",
    itemFoundSectionText: "text-xs text-gray-700 mt-1 line-clamp-2",
    itemTags:
      "bg-stone-400 rounded-full text-[11px] text-gray-50 mt-0.5 italic truncate",
  },
  sections: {
    siteBackground: "bg-stone-400",
    siteBorders: "border-x border-stone-600",
    headerBackground: "bg-stone-50 shadow-sm border-b border-stone-400",
    headerMobileBackground: "bg-stone-50 border-b border-stone-400 shadow-md",
    sidebarBackground: "bg-stone-50 border-r border-stone-400",
    contentBackground: "bg-gray-100",
  },
};
