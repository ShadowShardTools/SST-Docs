import { type StyleTheme } from "../application/types/StyleTheme";
import { darkTheme } from "./darkTheme";
import { lightTheme } from "./lightTheme";

export type SiteConfig = {
  logo: {
    image: string;
    text: string;
  };
  themes: {
    light: StyleTheme;
    dark: StyleTheme;
  };
};

export const siteConfig: SiteConfig = {
  logo: {
    image: "https://avatars.githubusercontent.com/u/107807003",
    text: "SST Docs",
  },
  themes: {
    light: lightTheme,
    dark: darkTheme,
  },
};
