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

export const DEFAULT_CAROUSEL_OPTIONS = {
  type: "loop" as const,
  gap: "1rem",
  arrows: true,
  pagination: false,
  autoplay: false,
  interval: 3000,
};
