// ⚠️  AUTO-GENERATED — DO NOT EDIT
import { lazy } from "react";

export const blockImports = {
  audio: lazy(() => import("../components/AudioBlock")),
  chart: lazy(() => import("../components/ChartBlock")),
  code: lazy(() => import("../components/CodeBlock")),
  divider: lazy(() => import("../components/DividerBlock")),
  graph: lazy(() => import("../components/GraphBlock")),
  image: lazy(() => import("../components/ImageBlock")),
  list: lazy(() => import("../components/ListBlock")),
  math: lazy(() => import("../components/MathBlock")),
  messageBox: lazy(() => import("../components/MessageBoxBlock")),
  table: lazy(() => import("../components/TableBlock")),
  text: lazy(() => import("../components/TextBlock")),
  title: lazy(() => import("../components/TitleBlock")),
  youtube: lazy(() => import("../components/YoutubeBlock")),
  unknown: lazy(() => import("../components/UnknownBlock")),
} as const;

export type BlockType = keyof typeof blockImports;
