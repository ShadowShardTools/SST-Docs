import { type StyleTheme } from "../application/types/StyleTheme";
import { darkTheme } from "./themes/darkTheme";
import { lightTheme } from "./themes/lightTheme";

export type StylesConfig = {
  logo: {
    image: string;
    text: string;
  };
  themes: {
    light: StyleTheme;
    dark: StyleTheme;
  };
  // For browser fetch
  publicDataPath: string;
  // For Node.js CLI (absolute/relative filesystem path)
  fsDataPath: string;
};

export const stylesConfig: StylesConfig = {
  logo: {
    image: "https://avatars.githubusercontent.com/u/107807003",
    text: "SST Docs",
  },
  themes: {
    light: lightTheme,
    dark: darkTheme,
  },
  publicDataPath: "/SST-Docs/data/",
  fsDataPath: "./public/SST-Docs/data/",
};
