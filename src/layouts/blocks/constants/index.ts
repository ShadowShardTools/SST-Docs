export const ALIGNMENT_CLASSES = {
  left: {
    text: "text-left",
    container: "mr-auto",
  },
  center: {
    text: "text-center",
    container: "mx-auto",
  },
  right: {
    text: "text-right",
    container: "ml-auto",
  },
} as const;

export const SPACING_CLASSES = {
  small: "mb-4",
  medium: "mb-6",
  large: "mb-8",
} as const;

export const MESSAGE_BOX_SIZES = {
  small: "p-3 text-sm",
  medium: "p-4 text-base",
  large: "p-6 text-lg",
} as const;

export const MESSAGE_BOX_ICONS = {
  info: "Info",
  warning: "AlertTriangle",
  error: "XCircle",
  success: "CheckCircle",
  neutral: "HelpCircle",
} as const;

export const CHART_COMPONENT_MAP = {
  bar: "Bar",
  line: "Line",
  radar: "Radar",
  doughnut: "Doughnut",
  polarArea: "PolarArea",
  bubble: "Bubble",
  pie: "Pie",
  scatter: "Scatter",
} as const;

export const DEFAULT_CAROUSEL_OPTIONS = {
  type: "loop" as const,
  gap: "1rem",
  arrows: true,
  pagination: false,
  autoplay: false,
  interval: 3000,
};

export const KATEX_CONFIG = {
  throwOnError: false,
  output: "html" as const,
  trust: false,
  strict: "warn" as const,
};

export const DESMOS_CONFIG = {
  expressions: true,
  keypad: true,
};
