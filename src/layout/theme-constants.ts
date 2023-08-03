import konveyorLogo from "@app/images/konveyor-logo.png";
import konveyorNavbarLogo from "@app/images/konveyor-navbar-logo.svg";

type ThemeType = "konveyor";
const defaultTheme: ThemeType = "konveyor";

type ThemeListType = {
  [key in ThemeType]: {
    name: string;
    logoSrc: string;
    logoNavbarSrc: string;
    faviconSrc?: string;
    websiteURL: string;
    documentationURL: string;
    sourceURL: string;
    discussionForumURL: string;
    mailingListURL: string;
    issueTrackingURL: string;
  };
};

const themeList: ThemeListType = {
  "konveyor": {
    name: "Konveyor",
    logoSrc: konveyorLogo,
    logoNavbarSrc: konveyorNavbarLogo,
    websiteURL: "https://konveyor.io/",
    documentationURL: "https://konveyor.io/community",
    sourceURL: "https://github.com/konveyor/static-report",
    discussionForumURL: "https://kubernetes.slack.com/archives/CR85S82A2",
    mailingListURL: "",
    issueTrackingURL: "https://github.com/konveyor/community",
  }
};

export const Theme =
  themeList[((window as any)["THEME"] as ThemeType) || defaultTheme];
