import type { ChartData } from "../../blocks/types/ChartData";
import type { CodeData } from "../../blocks/types/CodeData";
import type { DividerData } from "../../blocks/types/DividerData";
import type { GraphData } from "../../blocks/types/GraphData";
import type { ListData } from "../../blocks/types/ListData";
import type { MathData } from "../../blocks/types/MathData";
import type { MessageBoxData } from "../../blocks/types/MessageBoxData";
import type { TableData } from "../../blocks/types/TableData";
import type { TextData } from "../../blocks/types/TextData";
import type { TitleData } from "../../blocks/types/TitleData";

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
