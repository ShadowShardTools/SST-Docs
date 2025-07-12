import type { CodeSection } from "./CodeSection";
import type { TableCell } from "./TableCell";

export interface ContentBlock {
  type:
    | "title"
    | "description"
    | "list"
    | "quote"
    | "message-box"
    | "table"
    | "image"
    | "image-compare"
    | "image-compare-slider"
    | "image-carousel"
    | "audio"
    | "youtube"
    | "code"
    | "math"
    | "chart"
    | "graph";

  // Base
  content: string;
  scale?: string;

  // Title
  titleLevel?: number;
  titleAlignment?: "left" | "center" | "right";
  titleSpacing?: "small" | "medium" | "large";
  titleUnderline?: boolean;
  enableAnchorLink?: boolean;

  // List
  listItems?: string[];
  listType?: "ul" | "ol";
  listStartNumber?: number;
  listAriaLabel?: string;

  // Alert Box
  messageType?: "info" | "warning" | "error" | "success" | "neutral";
  messageSize?: "small" | "medium" | "large";
  showIcon?: boolean;

  // Table
  tableData?: TableCell[][];
  tableType?: "vertical" | "horizontal" | "matrix";

  // Image
  imageSrc?: string;
  imageAlt?: string;

  // Images compare
  imageBeforeSrc?: string;
  imageBeforeAlt?: string;
  imageAfterSrc?: string;
  imageAfterAlt?: string;

  // Images Carousel
  carouselImages?: { imageSrc: string; imageAlt?: string }[];

  // Audio
  audioSrc?: string;
  audioCaption?: string;
  audioMimeType?: string;

  // Youtube
  youtubeVideoId?: string;

  // Code
  codeName?: string;
  codeLanguage?: string;
  codeSections?: CodeSection[];
  codeShowLineNumbers?: boolean;
  codeAllowDownload?: boolean;
  codeMaxHeight?: string;
  codeWrapLines?: boolean;
  codeCollapsible?: boolean;
  codeDefaultCollapsed?: boolean;
  codeTitle?: string;

  // Chart
  chartData?: {
    title?: string;
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor?: string;
      borderColor?: string;
    }[];
  };
  chartType?: string;

  // Desmos
  graphExpressions?: string[];
}
