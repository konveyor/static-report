import React, { useMemo } from "react";

import {
  Badge,
  Button,
  Card,
  CardBody,
  Grid,
  GridItem,
  Stack,
  StackItem,
  Truncate,
} from "@patternfly/react-core";
import {
  TableComposable,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@patternfly/react-table";

import { ViolationProcessed } from "@app/models/api-enriched";
import { useFilesQuery } from "@app/queries/files";
import { SimpleMarkdown } from "@app/shared/components";
import { getMarkdown } from "@app/utils/rule-utils";

interface IIssueOverviewProps {
  issue: ViolationProcessed;
  onShowFile: (file: string, issue: ViolationProcessed) => void;
}

export const IssueOverview: React.FC<IIssueOverviewProps> = ({
  issue,
  onShowFile,
}) => {
  Object.keys(issue.files).forEach((uri, index) => {
    console.log("got file", uri, index)
  })

  return (
    <Stack hasGutter>
        <StackItem>
          <Grid hasGutter>
            <GridItem md={5}>
              <Card isCompact isFullHeight>
                <CardBody>
                  <TableComposable aria-label="Files table" variant="compact">
                    <Thead>
                      <Tr>
                        <Th>File</Th>
                        <Th>Incidents found</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                        {Object.keys(issue.files).map((uri, index) => (
                        <Tr key={index}>
                          <Td dataLabel="File" modifier="breakWord">
                            <FileLink
                              file={uri}
                              defaultText={uri}
                              onClick={() =>
                                onShowFile(
                                  uri,
                                  issue
                                )
                              }
                            />
                          </Td>
                          <Td dataLabel="Incidents found" width={10}>
                            <Badge isRead>{issue.files[uri]?.length}</Badge>
                          </Td>
                        </Tr>))}
                    </Tbody>
                  </TableComposable>
                </CardBody>
              </Card>
            </GridItem>
            <GridItem md={7}>
              <Card isCompact isFullHeight>
                <CardBody>
                  <SimpleMarkdown
                    children={getMarkdown(
                      issue.description || "",
                      issue.links,
                    )}
                  />
                </CardBody>
              </Card>
            </GridItem>
          </Grid>
        </StackItem>
    </Stack>
  );
};

interface IFileLinkProps {
  file: string;
  defaultText: string;
  onClick: () => void;
}

export const FileLink: React.FC<IFileLinkProps> = ({
  file,
  defaultText,
  onClick,
}) => {
  console.log("got file", file)
  return (
    <>
      {file ? (
        <Button variant="link" isInline onClick={onClick}>
          <Truncate content={defaultText || file} />
        </Button>
      ) : (
        defaultText
      )}
    </>
  );
};
