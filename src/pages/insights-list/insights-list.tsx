import React from "react";
import { useMatch, useNavigate } from "react-router-dom";

import {
  Divider,
  PageSection,
  PageSectionVariants,
  Text,
  TextContent,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from "@patternfly/react-core";

import { ALL_APPLICATIONS_ID } from "@app/Constants";
import { Context, SimpleContextSelector } from "@app/context/simple-context";
import { ViolationsTable } from "@app/shared/components/violations-table";

export const InsightsList: React.FC = () => {
  const matchInsightsPage = useMatch("/insights");
  const matchAllApplicationsPage = useMatch("/insights/applications");
  const matchSingleApplicationPage = useMatch(
    "/insights/applications/:applicationId"
  );

  const applicationId = matchInsightsPage
    ? undefined
    : matchAllApplicationsPage
    ? ALL_APPLICATIONS_ID
    : matchSingleApplicationPage?.params.applicationId;

  const navigate = useNavigate();

  const onContextChange = (context: Context) => {
    navigate("/insights/applications/" + context.key);
  };

  return (
    <>
      <PageSection padding={{ default: "noPadding" }}>
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
      <PageSection variant={PageSectionVariants.light}>
        <TextContent>
          <Text component="h1">Insights</Text>
          <Text component="small">
            This report provides a concise summary of all insights identified - issues with zero effort.
          </Text>
        </TextContent>
      </PageSection>
      <PageSection variant={PageSectionVariants.default}>
        <ViolationsTable applicationId={applicationId} insightsMode={true} />
      </PageSection>
    </>
  );
};