export interface ImageObject {
  width: number;
  height: number;
  scale: (n: number) => { width: number; height: number };
  bytesPerRow?: number;
}