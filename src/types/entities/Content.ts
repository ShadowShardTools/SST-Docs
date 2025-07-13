import type { AudioData } from "../data/AudioData";
import type { ChartData } from "../data/ChartData";
import type { CodeData } from "../data/CodeData";
import type { TitleData } from "../data/TitleData";

export interface Content {
  type?:
    | "title"
    | "description"
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
  audioData?: AudioData;
  codeData?: CodeData;
  chartData?: ChartData;
}
