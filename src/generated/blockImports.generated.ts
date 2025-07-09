// ⚠️  AUTO-GENERATED — DO NOT EDIT
import { lazy } from 'react';

export const blockImports = {
  'audio': lazy(() => import('../components/render/AudioBlock')),
  'chart': lazy(() => import('../components/render/ChartBlock')),
  'description': lazy(() => import('../components/render/DescriptionBlock')),
  'graph': lazy(() => import('../components/render/GraphBlock')),
  'image': lazy(() => import('../components/render/ImageBlock')),
  'image-carousel': lazy(() => import('../components/render/ImageCarouselBlock')),
  'image-compare': lazy(() => import('../components/render/ImageCompareBlock')),
  'image-compare-slider': lazy(() => import('../components/render/ImageCompareSliderBlock')),
  'list': lazy(() => import('../components/render/ListBlock')),
  'math': lazy(() => import('../components/render/MathBlock')),
  'quote': lazy(() => import('../components/render/QuoteBlock')),
  'table': lazy(() => import('../components/render/TableBlock')),
  'title-h1': lazy(() => import('../components/render/TitleH1Block')),
  'title-h2': lazy(() => import('../components/render/TitleH2Block')),
  'title-h3': lazy(() => import('../components/render/TitleH3Block')),
  'youtube': lazy(() => import('../components/render/YoutubeBlock')),
  'unknown': lazy(() => import('../components/render/UnknownBlock')),
} as const;

export type BlockType = keyof typeof blockImports;
