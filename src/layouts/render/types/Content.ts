import type {
  AudioData,
  ChartData,
  CodeData,
  DividerData,
  GraphData,
  ImageData,
  ImageCarouselData,
  ImageCompareData,
  ImageGridData,
  ListData,
  MathData,
  MessageBoxData,
  TableData,
  TextData,
  TitleData,
  YoutubeData,
} from "../../blocks/types";

export interface Content {
  type?:
    | "title"
    | "text"
    | "list"
    | "table"
    | "messageBox"
    | "divider"
    | "image"
    | "imageCompare"
    | "imageCarousel"
    | "imageGrid"
    | "audio"
    | "youtube"
    | "math"
    | "code"
    | "chart"
    | "graph";

  titleData?: TitleData;
  textData?: TextData;
  listData?: ListData;
  tableData?: TableData;
  messageBoxData?: MessageBoxData;
  dividerData?: DividerData;
  imageData?: ImageData;
  imageCompareData?: ImageCompareData;
  imageCarouselData?: ImageCarouselData;
  imageGridData?: ImageGridData;
  audioData?: AudioData;
  youtubeData?: YoutubeData;
  mathData?: MathData;
  codeData?: CodeData;
  chartData?: ChartData;
  graphData?: GraphData;
}
