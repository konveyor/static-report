import { useMemo } from "react";
import {
  Link,
  Outlet,
  useLocation,
  useMatch,
  useNavigate,
} from "react-router-dom";

import {
  Breadcrumb,
  BreadcrumbItem,
  PageSection,
  Tab,
  TabTitleText,
  Tabs,
  Text,
  TextContent,
} from "@patternfly/react-core";

import { useApplicationsQuery } from "@app/queries/applications";

export const ApplicationEdit: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const routeParams = useMatch("/applications/:applicationId/*");

  const allApplicationsQuery = useApplicationsQuery();

  const application = useMemo(() => {
    const applicationId = routeParams?.params.applicationId;
    return (
      allApplicationsQuery.data?.find((app) => app.id === applicationId) || null
    );
  }, [routeParams?.params, allApplicationsQuery.data]);

  const tabItems = useMemo(() => {
    const result: { title: string; path: string }[] = [
      {
        title: "Dashboard",
        path: `/applications/${application?.id}/dashboard`,
      },
      {
        title: "Issues",
        path: `/applications/${application?.id}/issues`,
      },
      {
        title: "Dependencies",
        path: `/applications/${application?.id}/dependencies`,
      },
      {
        title: "Technologies",
        path: `/applications/${application?.id}/technologies`,
      },
    ];
    return result;
  }, [
    application,
  ]);

  return (
    <>
      <PageSection type="breadcrumb">
        <Breadcrumb>
          <BreadcrumbItem>
            <Link to="/applications">Applications</Link>
          </BreadcrumbItem>
          <BreadcrumbItem isActive>{application?.name}</BreadcrumbItem>
        </Breadcrumb>
      </PageSection>
      <PageSection type="default" variant="light">
        <TextContent>
          <Text component="h1">{application?.name}</Text>
        </TextContent>
      </PageSection>
      <PageSection type="tabs" variant="light">
        <Tabs
          role="region"
          activeKey={tabItems.find((e) => e.path === location.pathname)?.path}
          onSelect={(_, tabKey) => navigate(`${tabKey}`)}
          isOverflowHorizontal={{ showTabCount: true }}
          // isFilled={true}
        >
          {tabItems.map((e, index) => (
            <Tab
              key={index}
              eventKey={e.path}
              title={<TabTitleText>{e.title}</TabTitleText>}
            />
          ))}
        </Tabs>
      </PageSection>
      <Outlet context={application} />
    </>
  );
};
