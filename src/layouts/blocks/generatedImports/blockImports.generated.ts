// AUTO-GENERATED FILE. DO NOT EDIT.
import { lazy } from "react";

export const blockImports = {
  "audio": lazy(() => import("../components/AudioBlock")),
  "chart": lazy(() => import("../components/ChartBlock")),
  "code": lazy(() => import("../components/CodeBlock")),
  "divider": lazy(() => import("../components/DividerBlock")),
  "image": lazy(() => import("../components/ImageBlock")),
  "imageCarousel": lazy(() => import("../components/ImageCarouselBlock")),
  "imageCompare": lazy(() => import("../components/ImageCompareBlock")),
  "imageGrid": lazy(() => import("../components/ImageGridBlock")),
  "list": lazy(() => import("../components/ListBlock")),
  "math": lazy(() => import("../components/MathBlock")),
  "messageBox": lazy(() => import("../components/MessageBoxBlock")),
  "table": lazy(() => import("../components/TableBlock")),
  "text": lazy(() => import("../components/TextBlock")),
  "title": lazy(() => import("../components/TitleBlock")),
  "youtube": lazy(() => import("../components/YoutubeBlock")),
  "unknown": lazy(() => import("../components/UnknownBlock")),
} as const;

export type BlockType = keyof typeof blockImports;
