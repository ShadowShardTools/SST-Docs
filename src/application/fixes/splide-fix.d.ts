declare module "@splidejs/react-splide" {
  import * as React from "react";

  export interface SplideProps extends React.PropsWithChildren {
    options?: Record<string, any>;
    hasTrack?: boolean;
    [key: string]: any;
  }

  export interface SplideSlideProps extends React.PropsWithChildren {}
  export interface SplideTrackProps extends React.PropsWithChildren {}

  export const Splide: React.FC<SplideProps>;
  export const SplideSlide: React.FC<SplideSlideProps>;
  export const SplideTrack: React.FC<SplideTrackProps>;
}
