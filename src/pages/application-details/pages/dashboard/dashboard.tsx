import React from "react";
import { useOutletContext } from "react-router-dom";

import { PageSection, Stack, StackItem } from "@patternfly/react-core";

import { ApplicationProcessed } from "@app/models/api-enriched";

import { IncidentsSection } from "./components/incidents-section";

export const Dashboard: React.FC = () => {
  const application = useOutletContext<ApplicationProcessed | null>();

  return (
    <>
      <PageSection>
        <Stack hasGutter>
          <StackItem>
            {application && <IncidentsSection application={application} />}
          </StackItem>
        </Stack>
      </PageSection>
    </>
  );
};
