import type { StyleTheme } from "../types/StyleTheme";

export const darkTheme: StyleTheme = {
  input:
    "text-sm text-gray-400 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
  text: {
    logoText: "text-xl font-semibold text-gray-50",
    titleLevel1: "text-4xl font-bold text-indigo-400 mb-3 mt-8 first:mt-0",
    titleLevel2: "text-2xl font-semibold text-gray-100 mb-4 mt-8 first:mt-0",
    titleLevel3: "text-xl font-medium text-gray-200 mb-3 mt-6 first:mt-0",
    titleAnchor: "text-gray-400 hover:text-blue-500",
    breadcrumb: "text-sm text-gray-400",
    general: "text-base text-gray-300 mb-2 leading-relaxed",
    alternative: "text-sm text-gray-400 mt-2 text-center italic",
    list: "list-inside text-gray-300 mb-2 space-y-1",
    math: "text-gray-200 text-lg",
  },
  hints: {
    text: "text-xs text-gray-400",
    key: "text-xs text-gray-400 border border-gray-600 rounded",
  },
  divider: {
    border: "border-gray-500",
    gradient: "from-transparent via-gray-500 to-transparent",
    text: "text-gray-500 text-sm",
  },
  buttons: {
    common:
      "font-bold text-gray-100 bg-indigo-900/50 border border-indigo-800 rounded-md transition-colors hover:bg-indigo-700/70",
    small:
      "text-xs font-semibold text-gray-100 bg-indigo-900 border border-indigo-600 rounded-md transition-colors hover:bg-indigo-700/70",
    tabSmall:
      "text-xs font-semibold text-indigo-300 bg-indigo-950 border border-indigo-600 rounded-md transition-colors hover:bg-indigo-700/70",
    tabSmallActive:
      "text-xs font-semibold text-gray-800 bg-lime-500 border border-lime-300 rounded-md transition-colors",
  },
  dropdown: {
    container: "bg-slate-800 border border-indigo-600 rounded-md shadow-lg",
    item: "text-white text-left hover:bg-indigo-600/50 transition-colors whitespace-nowrap",
    itemActive: "border-l-2 bg-indigo-900/60 font-bold",
  },
  messageBox: {
    info: "bg-blue-900/40 text-blue-200 border-blue-400/60",
    warning: "bg-yellow-900/40 text-yellow-200 border-yellow-400/60",
    error: "bg-red-900/40 text-red-200 border-red-400/60",
    success: "bg-green-900/40 text-green-200 border-green-400/60",
    neutral: "bg-indigo-300/20 text-gray-200 border-gray-500",
    quote: "bg-indigo-900/50 border-l-4 border-white text-white italic",
  },
  table: {
    cornerCell: "bg-indigo-900/50 font-bold text-gray-200 text-lg",
    headers: "bg-indigo-900/80 font-semibold text-gray-200 text-lg",
    rows: "bg-indigo-950/5 text-gray-200",
    border: "border-indigo-700",
    empty: "text-gray-500 text-center",
  },
  code: {
    header: "bg-indigo-900/80 text-white border-b border-indigo-500",
    language: "text-xs font-semibold text-indigo-300 mt-1 text-right",
    lines: "text-sm text-gray-500 border-r border-gray-300",
    empty: "bg-gray-50 text-gray-500 text-center text-sm border",
  },
  audioPlayer: {
    container: "bg-indigo-900/50",
    playButton:
      "bg-indigo-700 hover:bg-indigo-600 text-white transition-colors",
    time: "text-gray-400 text-xs tabular-nums text-right",
    slider: "bg-gray-300",
    sliderThumb:
      "[&::-webkit-slider-thumb]:bg-indigo-600 [&::-moz-range-thumb]:bg-indigo-600",
  },
  chart: {
    legendLabelColor: "#e5e7eb", // text-gray-200
    tooltipBg: "#1f2937", // gray-800
    tooltipTitleColor: "#facc15", // indigo-400
    tooltipBodyColor: "#f3f4f6", // gray-100
    tooltipBorderColor: "#4ade80", // green-400
    axisTickColor: "#e5e7eb", // gray-200
    gridLineColor: "rgba(255,255,255,0.1)",
  },
  header: {
    mobileNavigationToggle: "text-gray-500 hover:text-gray-700",
    mobileMenuToggle: "text-gray-500 hover:text-gray-700",
  },
  category: {
    empty: "text-gray-500 text-center",
    cardBody:
      "bg-indigo-900/50 border border-indigo-800 rounded-xl text-left transition-colors hover:bg-indigo-700/70",
    cardHeaderText: "text-gray-50 text-lg font-semibold mb-1",
    cardDescriptionText: "text-sm text-indigo-400 line-clamp-3",
  },
  navigation: {
    row: "text-gray-50 focus:outline-none",
    rowActive:
      "font-semibold text-gray-50 bg-indigo-900/60 border-l-2 border-white transition-colors",
    rowFocused: "ring-2 ring-indigo-600",
    rowHover: "hover:text-indigo-500 transition-colors",
    hideOrShowHintsText: "text-indigo-500 hover:underline focus:outline-none",
  },
  searchModal: {
    resultBackground: "bg-zinc-900",
    resultEmptyInputText: "text-gray-400 text-sm text-center",
    resultNoResultText: "text-gray-400 text-sm text-center",

    header: "bg-zinc-850 text-gray-400",
    footer: "bg-zinc-850",
    borders: "border-gray-500",

    item: "hover:bg-indigo-900/80 border-b border-indigo-400/30",
    selectedItem:
      "bg-indigo-900/60 hover:bg-indigo-900/80 border-y border-indigo-400/30",
    itemHeaderText: "font-bold text-indigo-400",
    itemFoundSectionText: "text-xs text-gray-300 mt-1 line-clamp-2",
    itemTags:
      "bg-indigo-400/40 rounded-full text-[11px] text-gray-100 mt-0.5 italic truncate",
  },
  sections: {
    siteBackground: "bg-slate-950",
    siteBorders: "border-x border-gray-700",
    headerBackground: "bg-zinc-900 shadow-sm border-b border-gray-700",
    headerMobileBackground: "bg-zinc-900 border-b border-gray-200 shadow-md",
    sidebarBackground: "bg-zinc-900 border-r border-gray-700",
    contentBackground: "bg-zinc-850",
  },
};
