import logo from "@app/images/logo.svg";
import navbarLogo from "@app/images/navbar-logo.svg";

type ThemeType = "default";
const defaultTheme: ThemeType = "default";

type ThemeListType = {
  [key in ThemeType]: {
    name: string;
    logoSrc: string;
    logoNavbarSrc: string;
    faviconSrc?: string;
    websiteURL: string;
    documentationURL: string;
  };
};

const themeList: ThemeListType = {
  "default": {
    name: "Konveyor",
    logoSrc: logo,
    logoNavbarSrc: navbarLogo,
    websiteURL: "https://konveyor.io/",
    documentationURL: "https://konveyor.io/community",
  }
};


export const Theme =
  themeList[((window as any)["THEME"] as ThemeType) || defaultTheme];
