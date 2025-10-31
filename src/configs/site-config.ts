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
};
