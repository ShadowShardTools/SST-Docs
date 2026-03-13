import type { AudioData } from "./AudioData.js";
import type { ChartData } from "./ChartData.js";
import type { CodeData } from "./CodeData.js";
import type { DividerData } from "./DividerData.js";
import type { ImageCarouselData } from "./ImageCarouselData.js";
import type { ImageCompareData } from "./ImageCompareData.js";
import type { ImageData } from "./ImageData.js";
import type { ImageGridData } from "./ImageGridData.js";
import type { ListData } from "./ListData.js";
import type { MathData } from "./MathData.js";
import type { MessageBoxData } from "./MessageBoxData.js";
import type { TableData } from "./TableData.js";
import type { TextData } from "./TextData.js";
import type { TitleData } from "./TitleData.js";
import type { YoutubeData } from "./YoutubeData.js";

type BaseContent<Type extends string> = { type: Type };

export type Content =
  | (BaseContent<"title"> & { titleData: TitleData })
  | (BaseContent<"text"> & { textData: TextData })
  | (BaseContent<"list"> & { listData: ListData })
  | (BaseContent<"table"> & { tableData: TableData })
  | (BaseContent<"messageBox"> & { messageBoxData: MessageBoxData })
  | (BaseContent<"divider"> & { dividerData: DividerData })
  | (BaseContent<"image"> & { imageData: ImageData })
  | (BaseContent<"imageCompare"> & { imageCompareData: ImageCompareData })
  | (BaseContent<"imageCarousel"> & { imageCarouselData: ImageCarouselData })
  | (BaseContent<"imageGrid"> & { imageGridData: ImageGridData })
  | (BaseContent<"audio"> & { audioData: AudioData })
  | (BaseContent<"youtube"> & { youtubeData: YoutubeData })
  | (BaseContent<"math"> & { mathData: MathData })
  | (BaseContent<"code"> & { codeData: CodeData })
  | (BaseContent<"chart"> & { chartData: ChartData });
