// ⚠️  AUTO-GENERATED — DO NOT EDIT
import { lazy } from 'react';

export const blockImports = {
  'chart': lazy(() => import('../components/render/ChartBlock')),
  'code': lazy(() => import('../components/render/CodeBlock')),
  'description': lazy(() => import('../components/render/DescriptionBlock')),
  'graph': lazy(() => import('../components/render/GraphBlock')),
  'list': lazy(() => import('../components/render/ListBlock')),
  'math': lazy(() => import('../components/render/MathBlock')),
  'quote': lazy(() => import('../components/render/QuoteBlock')),
  'table': lazy(() => import('../components/render/TableBlock')),
  'title-h2': lazy(() => import('../components/render/TitleH2Block')),
  'title-h3': lazy(() => import('../components/render/TitleH3Block')),
  'youtube': lazy(() => import('../components/render/YoutubeBlock')),
  'unknown': lazy(() => import('../components/render/UnknownBlock')),
} as const;

export type BlockType = keyof typeof blockImports;
