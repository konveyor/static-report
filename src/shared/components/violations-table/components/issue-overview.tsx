import React, { useState, useCallback, useMemo } from "react";
import { useDebounce } from "usehooks-ts";

import {
  Button,
  Card,
  CardBody,
  Grid,
  GridItem,
  Stack,
  StackItem,
  Truncate,
  ToolbarItem,
  SearchInput,
  CardHeader,
  CardTitle,
  Text,
  TextContent
} from "@patternfly/react-core";

import {
  ICell,
  IRow,
  cellWidth,
  sortable,
} from "@patternfly/react-table";

import {
  SimpleTableWithToolbar
} from "@app/shared/components/simple-table-with-toolbar"
import {
  useTable,
  useTableControls
} from "@app/shared/hooks"

import { IssueProcessed } from "@app/models/api-enriched";
import { SimpleMarkdown } from "@app/shared/components";
import { getMarkdown } from "@app/utils/utils";
import { DispersedFile } from "@app/models/file";
import { useDispersedFiles } from "@app/queries/report";

interface IIssueOverviewProps {
  issue: IssueProcessed;
  onShowFile: (file: DispersedFile, issue: IssueProcessed) => void;
}

const DataKey = "DataKey"

const columns: ICell[] = [
  {
    title: "File",
    transforms: [cellWidth(80), sortable],
    cellTransforms: [],
  },
  {
    title: "Total",
    transforms: [cellWidth(20), sortable],
  },
]

interface TableData extends DispersedFile {}

export const compareByColumnIndex = (
  a: TableData,
  b: TableData,
  columnIndex?: number
) => {
  switch (columnIndex) {
    case 0: // name
      return a.name.localeCompare(b.name);
    case 1: // count
      return a.totalIncidents - b.totalIncidents;
    default:
      return 0;
  }
};

export const IssueOverview: React.FC<IIssueOverviewProps> = ({
  issue,
  onShowFile,
}) => {
  const [filterText, setFilterText] = useState("");
  const debouncedFilterText = useDebounce<string>(filterText, 250);
  const dispersedFilesQuery = useDispersedFiles(issue);

  const items: TableData[] = useMemo(() => 
    dispersedFilesQuery.data?.filter((f) => f.totalIncidents !== 0) || [], 
  [dispersedFilesQuery.data])

  const filterItem = useCallback(
    (item: TableData) => {
      let isFilterTextFilterCompliant = true;
      if (debouncedFilterText && debouncedFilterText.trim().length > 0) {
        isFilterTextFilterCompliant =
          item.name.toLowerCase().indexOf(debouncedFilterText.toLowerCase()) !==
          -1;
      }
      return isFilterTextFilterCompliant
    }, [debouncedFilterText]
  );

  const {
    page: currentPage,
    sortBy: currentSortBy,
    changePage: onPageChange,
    changeSortBy: onChangeSortBy,
  } = useTableControls();

  const { pageItems, filteredItems } = useTable<TableData>({
    items,
    filterItem,
    currentPage: currentPage,
    currentSortBy: currentSortBy,
    compareToByColumn: compareByColumnIndex,
  });

  const rows: IRow[] = useMemo(() => {
    const rows: IRow[] = [];
    pageItems.forEach((item) => {
      rows.push({
        [DataKey]: item,
        cells: [
          {
            title: <>
              <FileLink
                file={item.name}
                defaultText={item.displayName}
                onClick={() =>
                  onShowFile(
                    item,
                    issue
                  )
                }/>
            </>,
          },
          {
            title: item.totalIncidents,
          }
        ],
      });
    });

    return rows;
  }, [pageItems, issue, onShowFile]);

  return (
    <Stack hasGutter>
        <StackItem>
          <Grid hasGutter>
            <GridItem md={5}>
              <SimpleTableWithToolbar
                hasTopPagination
                hasBottomPagination
                currentPage={currentPage}
                onPageChange={onPageChange}
                sortBy={
                  currentSortBy || { index: undefined, defaultDirection: "asc" }
                }
                onSort={onChangeSortBy}
                totalCount={filteredItems.length}
                filtersApplied={filterText.trim().length > 0}
                cells={columns}
                rows={rows}
                isLoading={dispersedFilesQuery.isFetching || dispersedFilesQuery.isLoading}
                toolbarToggle={
                  <>
                    <ToolbarItem variant="search-filter">
                      <SearchInput
                        value={filterText}
                        onChange={setFilterText}
                        onClear={() => setFilterText("")}
                      />
                    </ToolbarItem>
                    </>
                }
              >
              </SimpleTableWithToolbar>
            </GridItem>
            <GridItem md={7}>
              <Card isCompact isFullHeight>
                <CardHeader>
                    <CardTitle>
                    <TextContent>
                      <>
                        <Text component="h2">{issue.ruleID}</Text>
                      </>
                    </TextContent>
                    </CardTitle>
                </CardHeader>
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
