import React from "react";
import { useMatch, useNavigate } from "react-router-dom";

import {
  Divider,
  PageSection,
  PageSectionVariants,
  Content,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from "@patternfly/react-core";

import { ALL_APPLICATIONS_ID } from "@app/Constants";
import { Context, SimpleContextSelector } from "@app/context/simple-context";
import { ViolationsTable } from "@app/shared/components/violations-table";

export const IssuesList: React.FC = () => {
  const matchIssuesPage = useMatch("/issues");
  const matchAllApplicationsPage = useMatch("/issues/applications");
  const matchSingleApplicationPage = useMatch(
    "/issues/applications/:applicationId"
  );

  const applicationId = matchIssuesPage
    ? undefined
    : matchAllApplicationsPage
    ? ALL_APPLICATIONS_ID
    : matchSingleApplicationPage?.params.applicationId;

  const navigate = useNavigate();

  const onContextChange = (context: Context) => {
    navigate("/issues/applications/" + context.key);
  };

  return (
    <>
      <PageSection hasBodyWrapper={false} padding={{ default: "noPadding" }}>
        <Toolbar>
          <ToolbarContent>
            <ToolbarItem>Application:</ToolbarItem>
            <ToolbarItem>
              <SimpleContextSelector
                contextKeyFromURL={applicationId}
                onChange={onContextChange}
              />
            </ToolbarItem>
          </ToolbarContent>
        </Toolbar>
      </PageSection>
      <Divider />
      <PageSection hasBodyWrapper={false} >
        <Content>
          <Content component="h1">Issues</Content>
          <Content component="small">
            This report provides a concise summary of all issues identified.
          </Content>
        </Content>
      </PageSection>
      <PageSection hasBodyWrapper={false} variant={PageSectionVariants.default}>
        <ViolationsTable applicationId={applicationId} />
      </PageSection>
    </>
  );
};
