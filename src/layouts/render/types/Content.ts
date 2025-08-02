import type { ChartData } from "./data/ChartData";
import type { CodeData } from "./data/CodeData";
import type { DividerData } from "./data/DividerData";
import type { GraphData } from "./data/GraphData";
import type { ListData } from "./data/ListData";
import type { MathData } from "./data/MathData";
import type { MessageBoxData } from "./data/MessageBoxData";
import type { TableData } from "./data/TableData";
import type { TextData } from "./data/TextData";
import type { TitleData } from "./data/TitleData";

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
