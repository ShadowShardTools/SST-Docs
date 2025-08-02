// ⚠️  AUTO-GENERATED — DO NOT EDIT
import { lazy } from 'react';

export const blockImports = {
  'audio': lazy(() => import('../components/blocks/AudioBlock')),
  'chart': lazy(() => import('../components/blocks/ChartBlock')),
  'code': lazy(() => import('../components/blocks/CodeBlock')),
  'divider': lazy(() => import('../components/blocks/DividerBlock')),
  'graph': lazy(() => import('../components/blocks/GraphBlock')),
  'image': lazy(() => import('../components/blocks/ImageBlock')),
  'list': lazy(() => import('../components/blocks/ListBlock')),
  'math': lazy(() => import('../components/blocks/MathBlock')),
  'message-box': lazy(() => import('../components/blocks/MessageBoxBlock')),
  'table': lazy(() => import('../components/blocks/TableBlock')),
  'text': lazy(() => import('../components/blocks/TextBlock')),
  'title': lazy(() => import('../components/blocks/TitleBlock')),
  'youtube': lazy(() => import('../components/blocks/YoutubeBlock')),
  'unknown': lazy(() => import('../components/blocks/UnknownBlock')),
} as const;

export type BlockType = keyof typeof blockImports;
