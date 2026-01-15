import React from "react";

import { Page, PageSidebar, PageSidebarBody } from "@patternfly/react-core";

import { HeaderApp } from "./header";
import { SidebarApp } from "./sidebar";

export const DefaultLayout: React.FC = ({ children }) => {
  return (
    <Page
      masthead={<HeaderApp />}
      sidebar={
        <PageSidebar>
          <PageSidebarBody>
            <SidebarApp />
          </PageSidebarBody>
        </PageSidebar>
      }
      isManagedSidebar
    >
      {children}
    </Page>
  );
};
