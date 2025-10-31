export interface YoutubeData {
  youtubeVideoId: string; // can be raw ID or full URL
  caption?: string;
  scale?: number;
  alignment?: "left" | "center" | "right";
}
