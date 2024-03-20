import { useMemo } from "react";
import { useOutletContext } from "react-router-dom";

import {
  Card,
  CardBody,
  CardTitle,
  Divider,
  EmptyState,
  EmptyStateIcon,
  EmptyStateVariant,
  Gallery,
  GalleryItem,
  Label,
  LabelGroup,
  PageSection,
  Title,
} from "@patternfly/react-core";
import InfoAltIcon from "@patternfly/react-icons/dist/esm/icons/info-alt-icon";

import { ApplicationProcessed } from "@app/models/api-enriched";

import { TagDto } from "@app/api/report";

export const Technologies: React.FC = () => {
  const application = useOutletContext<ApplicationProcessed | null>();

  const allTags: TagDto[] = useMemo(() => application?.tags || [], [application])

  const tagsByCategory: {[key: string]: string[]} = allTags.reduce<{[key: string]: string[]}>((acc, tag) => {
    acc[tag.category.name] = acc[tag.category.name] ? [...acc[tag.category.name], tag.name] : [tag.name];
    return acc
  }, {})

  return (
    <>
      <PageSection>
        <Gallery hasGutter minWidths={{ md: "400px" }}>
          {Object.entries(tagsByCategory).map(([category, tags], index) => (
            <GalleryItem key={index}>
              <Card isFullHeight>
                <CardTitle>
                  {category}
                </CardTitle>
                <Divider />
                <CardBody>
                  {
                    tags.length > 0 ? (
                      <LabelGroup numLabels={5}>
                        {
                          tags.map((value, tagIndex) => 
                            <Label variant="outline">{value}</Label>)
                        }
                      </LabelGroup>
                    ) : (
                      <EmptyState variant={EmptyStateVariant.small}>
                        <EmptyStateIcon icon={InfoAltIcon} />
                        <Title headingLevel="h4" size="md">
                          No data to show
                        </Title>
                      </EmptyState>
                    )
                  }
                </CardBody>
              </Card>
            </GalleryItem>
          ))}
        </Gallery>
      </PageSection>
    </>
  );
};
