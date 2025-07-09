export interface ContentBlock {
  type:
    | "title-h1"
    | "title-h2"
    | "title-h3"
    | "description"
    | "list"
    | "quote"
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

  content: string;
  scale?: string;

  listItems?: string[];

  tableHeaders?: string[];
  tableRows?: string[][];

  // Image
  imageSrc?: string;
  imageAlt?: string;

  // Image compare
  imageBeforeSrc?: string;
  imageBeforeAlt?: string;
  imageAfterSrc?: string;
  imageAfterAlt?: string;

  // Carousel
  carouselImages?: { imageSrc: string; imageAlt?: string }[];

  // Audio
  audioSrc?: string;
  audioCaption?: string;
  audioMimeType?: string;

  // Youtube
  youtubeVideoId?: string;

  // Code
  scriptName?: string;
  scriptLanguage?: string;

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
