import React from "react";

import {
  AboutModal,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  List,
  ListItem,
  TextContent,
} from "@patternfly/react-core";
import EnvelopeIcon from "@patternfly/react-icons/dist/esm/icons/envelope-icon";
import GithubIcon from "@patternfly/react-icons/dist/esm/icons/github-icon";
import GlobeIcon from "@patternfly/react-icons/dist/esm/icons/globe-icon";
import InfoAltIcon from "@patternfly/react-icons/dist/esm/icons/info-alt-icon";

import { Theme } from "./theme-constants";

const VERSION = (window as any)["version"];

interface IButtonAboutAppProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutApp: React.FC<IButtonAboutAppProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <AboutModal
      isOpen={isOpen}
      onClose={onClose}
      brandImageAlt="Brand Image"
      brandImageSrc={Theme.logoSrc}
      productName={Theme.name}
      className="about-app__component"
    >
      <TextContent>
        <h4>About</h4>
        <p>
          <a href={Theme.websiteURL} target="_blank" rel="noopener noreferrer">
            {Theme.name}
          </a>{" "}
          allows application architects and developers to quickly decompile,
          analyze, assess and modernize large scale application portfolios and
          migrate them to Red Hat Middleware, cloud and containers.
        </p>
      </TextContent>
      <TextContent className="pf-u-py-xl">
        <Grid hasGutter>
          <GridItem lg={7}>
            <span className="dt">Version</span>
          </GridItem>
          <GridItem lg={5}>{VERSION}</GridItem>
        </Grid>
      </TextContent>
      <TextContent className="pf-u-py-xl">
        <h4>Links</h4>
        <List>
          <ListItem>
            <a
              href={Theme.websiteURL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Website
            </a>
          </ListItem>
          <ListItem>
            <a
              href={Theme.documentationURL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Documentation
            </a>
          </ListItem>
        </List>
      </TextContent>
      <div>
        <Flex>
          <FlexItem>
            <a
              href={Theme.sourceURL}
              rel="noopener noreferrer"
              target="_blank"
            >
              <i>
                <GithubIcon />
              </i>{" "}
              Source
            </a>
          </FlexItem>
          <FlexItem>
            <a
              href={Theme.discussionForumURL}
              rel="noopener noreferrer"
              target="_blank"
            >
              <i>
                <GlobeIcon />
              </i>{" "}
              Discussion forum
            </a>
          </FlexItem>
          <FlexItem>
            <a
              href={Theme.mailingListURL}
              rel="noopener noreferrer"
              target="_blank"
            >
              <i>
                <EnvelopeIcon />
              </i>{" "}
              Mailing list
            </a>
          </FlexItem>
          <FlexItem>
            <a
              href={Theme.issueTrackingURL}
              rel="noopener noreferrer"
              target="_blank"
            >
              <i>
                <InfoAltIcon />
              </i>{" "}
              Issue tracking
            </a>
          </FlexItem>
        </Flex>
      </div>
    </AboutModal>
  );
};
