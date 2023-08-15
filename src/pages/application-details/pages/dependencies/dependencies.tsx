import React from "react";
import { useOutletContext } from "react-router-dom";

import { PageSection } from "@patternfly/react-core";

import { ReportDto } from "@app/api/report";
import { DependenciesTable } from "@app/shared/components";

export const Dependencies: React.FC = () => {
  const application = useOutletContext<ReportDto | null>();

  return (
    <PageSection>
      <DependenciesTable applicationId={application?.id} />
    </PageSection>
  );
};
