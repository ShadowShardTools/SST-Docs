import type { AudioData } from "../data/AudioData";
import type { ChartData } from "../data/ChartData";
import type { CodeData } from "../data/CodeData";
import type { DividerData } from "../data/DividerData";
import type { GraphData } from "../data/GraphData";
import type { ImageData } from "../data/ImageData";
import type { ListData } from "../data/ListData";
import type { MathData } from "../data/MathData";
import type { MessageBoxData } from "../data/MessageBoxData";
import type { TableData } from "../data/TableData";
import type { TextData } from "../data/TextData";
import type { TitleData } from "../data/TitleData";

export interface Content {
  type?:
    | "title"
    | "text"
    | "list"
    | "message-box"
    | "table"
    | "image"
    | "audio"
    | "youtube"
    | "code"
    | "math"
    | "chart"
    | "graph";

  titleData?: TitleData;
  textData?: TextData;
  listData?: ListData;
  tableData?: TableData;
  dividerData?: DividerData;
  imageData?: ImageData;
  messageBoxData?: MessageBoxData;
  audioData?: AudioData;
  mathData?: MathData;
  graphData?: GraphData;
  codeData?: CodeData;
  chartData?: ChartData;
}
