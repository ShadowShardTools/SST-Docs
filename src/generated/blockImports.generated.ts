// ⚠️  AUTO-GENERATED — DO NOT EDIT
import { lazy } from 'react';

export const blockImports = {
  'audio': lazy(() => import('../components/render/AudioBlock')),
  'chart': lazy(() => import('../components/render/ChartBlock')),
  'code': lazy(() => import('../components/render/CodeBlock')),
  'divider': lazy(() => import('../components/render/DividerBlock')),
  'graph': lazy(() => import('../components/render/GraphBlock')),
  'image': lazy(() => import('../components/render/ImageBlock')),
  'list': lazy(() => import('../components/render/ListBlock')),
  'math': lazy(() => import('../components/render/MathBlock')),
  'message-box': lazy(() => import('../components/render/MessageBoxBlock')),
  'table': lazy(() => import('../components/render/TableBlock')),
  'text': lazy(() => import('../components/render/TextBlock')),
  'title': lazy(() => import('../components/render/TitleBlock')),
  'youtube': lazy(() => import('../components/render/YoutubeBlock')),
  'unknown': lazy(() => import('../components/render/UnknownBlock')),
} as const;

export type BlockType = keyof typeof blockImports;
