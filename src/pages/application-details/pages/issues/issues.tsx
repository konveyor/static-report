import React from "react";
import { useOutletContext } from "react-router-dom";

import { PageSection } from "@patternfly/react-core";

import { ApplicationProcessed } from "@app/models/api-enriched";
import { ViolationsTable } from "@app/shared/components";

export const Issues: React.FC = () => {
  const application = useOutletContext<ApplicationProcessed | null>();

  return (
    <PageSection>
      <ViolationsTable applicationId={application?.id} />
    </PageSection>
  );
};
