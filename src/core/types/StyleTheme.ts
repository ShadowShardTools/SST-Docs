export type StyleTheme = {
  input: string;
  text: {
    logoText: string;
    documentTitle: string;
    breadcrumb: string;
    titleLevel1: string;
    titleLevel2: string;
    titleLevel3: string;
    titleAnchor: string;
    general: string;
    alternative: string;
    caption: string;
    list: string;
    math: string;
  };
  hyperlink: {
    link: string;
    linkMuted: string;
  };
  hints: {
    text: string;
    key: string;
  };
  divider: {
    border: string;
    gradient: string;
    text: string;
  };
  buttons: {
    common: string;
    tab: string;
    tabActive: string;
  };
  dropdown: {
    container: string;
    item: string;
    itemActive: string;
  };
  messageBox: {
    info: string;
    warning: string;
    error: string;
    success: string;
    neutral: string;
    quote: string;
  };
  table: {
    cornerCell: string;
    headers: string;
    rows: string;
    border: string;
    empty: string;
  };
  code: {
    header: string;
    language: string;
    lines: string;
    empty: string;
  };
  audioPlayer: {
    container: string;
    playButton: string;
    time: string;
    slider: string;
    sliderThumb: string;
    sliderTrackColor: string;
    sliderTrackColorDark: string;
    sliderFillColor: string;
    sliderFillColorDark: string;
  };
  chart: {
    legendLabelColor: string;
    tooltipBg: string;
    tooltipTitleColor: string;
    tooltipBodyColor: string;
    tooltipBorderColor: string;
    axisTickColor: string;
    gridLineColor: string;
  };
  chartDark: {
    legendLabelColor: string;
    tooltipBg: string;
    tooltipTitleColor: string;
    tooltipBodyColor: string;
    tooltipBorderColor: string;
    axisTickColor: string;
    gridLineColor: string;
  };
  modal: {
    header: string;
    content: string;
    footer: string;
    borders: string;
  };
  searchModal: {
    resultEmptyInputText: string;
    resultNoResultText: string;
    item: string;
    selectedItem: string;
    itemHeaderText: string;
    itemFoundSectionText: string;
    itemTags: string;
  };
  navigation: {
    row: string;
    rowActive: string;
    rowFocused: string;
    rowHover: string;
    hideOrShowHintsText: string;
  };
  category: {
    empty: string;
    cardBody: string;
    cardHeaderText: string;
    cardDescriptionText: string;
  };
  sections: {
    siteBackground: string;
    siteBorders: string;
    headerBackground: string;
    headerMobileBackground: string;
    sidebarBackground: string;
    documentHeaderBackground: string;
    contentBackground: string;
  };
  header: {
    mobileNavigationToggle: string;
    mobileMenuToggle: string;
  };
};
