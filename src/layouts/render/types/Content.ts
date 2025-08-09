import type {
  AudioData,
  ChartData,
  CodeData,
  DividerData,
  GraphData,
  ImageData,
  ListData,
  MathData,
  MessageBoxData,
  TableData,
  TextData,
  TitleData,
} from "../../blocks/types";

export interface Content {
  type?:
    | "title"
    | "text"
    | "list"
    | "table"
    | "message-box"
    | "divider"
    | "image"
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
  audioData?: AudioData;
  mathData?: MathData;
  codeData?: CodeData;
  chartData?: ChartData;
  graphData?: GraphData;
}
