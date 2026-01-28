import type { Content, MessageBoxData } from "@shadow-shard-tools/docs-core";

export type BlockType = Content["type"];

export const BLOCK_LABELS: Record<BlockType, string> = {
  title: "Title",
  text: "Text",
  list: "List",
  table: "Table",
  messageBox: "Message box",
  divider: "Divider",
  image: "Image",
  imageCompare: "Image compare",
  imageCarousel: "Image carousel",
  imageGrid: "Image grid",
  audio: "Audio",
  youtube: "YouTube",
  math: "Math",
  code: "Code",
  chart: "Chart",
};

const defaultMessageBox: MessageBoxData = {
  type: "info",
  text: "Message text",
  showIcon: true,
};

export const DEFAULT_BLOCKS: Record<BlockType, Content> = {
  title: {
    type: "title",
    titleData: {
      text: "New heading",
      level: 2,
      enableAnchorLink: true,
    },
  },
  text: {
    type: "text",
    textData: {
      text: "New paragraph",
    },
  },
  list: {
    type: "list",
    listData: {
      type: "ul",
      items: ["List item"],
    },
  },
  table: {
    type: "table",
    tableData: {
      type: "horizontal",
      data: [
        [
          { content: "Column 1", scope: "col" },
          { content: "Column 2", scope: "col" },
        ],
        [{ content: "Row 1" }, { content: "Value" }],
        [{ content: "Row 2" }, { content: "Value" }],
      ],
    },
  },
  messageBox: {
    type: "messageBox",
    messageBoxData: defaultMessageBox,
  },
  divider: {
    type: "divider",
    dividerData: {
      type: "line",
    },
  },
  image: {
    type: "image",
    imageData: {
      image: { src: "images/example.jpg", alt: "Image description" },
      alignment: "center",
      scale: 1,
    },
  },
  imageCompare: {
    type: "imageCompare",
    imageCompareData: {
      type: "slider",
      beforeImage: { src: "images/before.jpg", alt: "Before" },
      afterImage: { src: "images/after.jpg", alt: "After" },
      alignment: "center",
    },
  },
  imageCarousel: {
    type: "imageCarousel",
    imageCarouselData: {
      images: [
        { src: "images/slide-1.jpg", alt: "Slide 1" },
        { src: "images/slide-2.jpg", alt: "Slide 2" },
      ],
      carouselOptions: { pagination: true, arrows: true },
    },
  },
  imageGrid: {
    type: "imageGrid",
    imageGridData: {
      images: [{ src: "images/example.jpg", alt: "Grid item" }],
      scale: 1,
      alignment: "center",
    },
  },
  audio: {
    type: "audio",
    audioData: {
      src: "audio/example.mp3",
      caption: "Audio clip",
      mimeType: "audio/mpeg",
    },
  },
  youtube: {
    type: "youtube",
    youtubeData: {
      youtubeVideoId: "dQw4w9WgXcQ",
      caption: "YouTube embed",
    },
  },
  math: {
    type: "math",
    mathData: {
      expression: "E = mc^2",
      alignment: "center",
    },
  },
  code: {
    type: "code",
    codeData: {
      content: "// code goes here",
      language: "javascript",
      wrapLines: false,
      defaultCollapsed: true,
    },
  },
  chart: {
    type: "chart",
    chartData: {
      type: "bar",
      title: "Sample chart",
      labels: ["A", "B", "C"],
      datasets: [{ label: "Data", data: [1, 2, 3] }],
      alignment: "center",
      scale: 1,
    },
  },
};
