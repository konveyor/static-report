import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Label,
  PageSection,
  PageSectionVariants,
  SearchInput,
  Split,
  SplitItem,
  Toolbar,
  ToolbarContent,
  ToolbarFilter,
  ToolbarGroup,
  ToolbarItem,
  ToolbarItemVariant,
  ToolbarToggleGroup,
} from "@patternfly/react-core";
import FilterIcon from "@patternfly/react-icons/dist/esm/icons/filter-icon";
import TagIcon from "@patternfly/react-icons/dist/esm/icons/tag-icon";
import TaskIcon from "@patternfly/react-icons/dist/esm/icons/task-icon";
import {
  IExtraData,
  IRowData,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@patternfly/react-table";

import { ApplicationProcessed } from "@app/models/api-enriched";
import { useAllApplications } from "@app/queries/report";
import {
  SimpleSelect,
  SimplePagination,
  ConditionalTableBody,
} from "@app/shared/components";
import {
  useTable,
  useTableControls,
  useToolbar,
  useCellSelectionState,
} from "@app/shared/hooks";
import type { ToolbarLabel } from "@app/shared/hooks/useToolbar";
import { capitalizeFirstLetter } from "@app/utils/utils";

import "./application-list.css";

enum ColumnKey {
  tags = "tags",
  incidents = "incidents",
}
const columnKeys: ColumnKey[] = Object.values(ColumnKey) as ColumnKey[];

export const compareByColumnIndex = (
  a: ApplicationProcessed,
  b: ApplicationProcessed,
  columnIndex?: number
) => {
  switch (columnIndex) {
    case 0: // name
      return a.name.localeCompare(b.name);
    default:
      return 0;
  }
};

export const ApplicationList: React.FC = () => {
  const [filterText, setFilterText] = useState("");
  const { filters, setFilter, removeFilter, clearAllFilters } = useToolbar<
    "tag",
    string | ToolbarLabel
  >();

  // ToolbarLabelGroup type for v6
  type ToolbarLabelGroup = { key: string; name: string };

  const applications = useAllApplications();

  const allTags = useMemo(() => {
    const allTags = (applications.data || []).flatMap((f) => f.tagsFlat);
    return Array.from(new Set(allTags)).sort((a, b) => a.localeCompare(b));
  }, [applications.data]);

  const issueByCategory: { [id: string]: { [cat: string]: number } } =
    useMemo(() => {
      return (applications?.data || []).reduce((result, app) => {
        const issueData = app.issues.reduce((acc, issue) => {
          acc[issue.category] = acc[issue.category] || 0;
          acc[issue.category] += issue.totalIncidents;
          return acc;
        }, {} as { [issueKey: string]: number });
        result[app.id] = issueData;
        return result;
      }, {} as { [appId: string]: { [issueKey: string]: number } });
    }, [applications.data]);

  const {
    page: currentPage,
    sortBy: currentSortBy,
    changePage: onPageChange,
    changeSortBy: onChangeSortBy,
  } = useTableControls();

  const { pageItems, filteredItems } = useTable<ApplicationProcessed>({
    items: applications.data || [],
    currentPage: currentPage,
    currentSortBy: currentSortBy,
    compareToByColumn: compareByColumnIndex,
    filterItem: (item) => {
      let isFilterTextFilterCompliant = true;
      if (filterText && filterText.trim().length > 0) {
        isFilterTextFilterCompliant =
          item.name.toLowerCase().indexOf(filterText.toLowerCase()) !== -1;
      }

      let isTagFilterCompliant = true;
      const selectedTags = filters.get("tag") || [];
      if (selectedTags.length > 0) {
        isTagFilterCompliant = selectedTags.some((f) =>
          item.tags.flatMap((t) => t.name).some((t) => f === t)
        );
      }

      return isFilterTextFilterCompliant && isTagFilterCompliant;
    },
  });

  const { isCellSelected, isSomeCellSelected, toggleCellSelected } =
    useCellSelectionState<string, ColumnKey>({
      rows: pageItems.map((f) => f.id),
      columns: columnKeys,
    });

  // Reset pagination when application change
  useEffect(() => {
    onPageChange({ page: 1, perPage: currentPage.perPage });
  }, [filters, onPageChange, currentPage.perPage]);

  return (
    <>
      <PageSection>
        <h1>Applications</h1>
        <small>
          This report lists all analyzed applications. Select an individual
          application to show more details.
        </small>
      </PageSection>
      <PageSection variant={PageSectionVariants.default}>
        <Toolbar
          className="pf-m-toggle-group-container"
          collapseListedFiltersBreakpoint="xl"
          clearAllFilters={clearAllFilters}
        >
          <ToolbarContent>
            <ToolbarToggleGroup toggleIcon={<FilterIcon />} breakpoint="xl">
              <ToolbarItem>
                <SearchInput
                  value={filterText}
                  onChange={(_, value) => setFilterText(value)}
                  onClear={() => {
                    setFilterText("");
                  }}
                />
              </ToolbarItem>
              <ToolbarGroup variant="filter-group">
                <ToolbarFilter
                  labels={filters.get("tag")}
                  deleteLabel={(
                    category: string | ToolbarLabelGroup,
                    label: string | ToolbarLabel
                  ) => removeFilter("tag", label)}
                  deleteLabelGroup={() => setFilter("tag", [])}
                  categoryName={{ key: "tag", name: "Tag" }}
                >
                  <SimpleSelect
                    width={250}
                    maxHeight={300}
                    toggleIcon={<FilterIcon />}
                    variant="checkbox"
                    aria-label="tag"
                    aria-labelledby="tag"
                    placeholderText="Tag"
                    value={filters.get("tag") as string[]}
                    options={allTags}
                    onChange={(option) => {
                      const optionValue = option as string;

                      const currentTags = (filters.get("tag") as string[] | undefined) || [];
                      const elementExists = currentTags.some(
                        (f) => f === optionValue
                      );
                      let newElements: string[];
                      if (elementExists) {
                        newElements = currentTags
                          .filter((f) => f !== optionValue);
                      } else {
                        newElements = [
                          ...currentTags,
                          optionValue,
                        ];
                      }

                      setFilter("tag", newElements);
                    }}
                    hasInlineFilter
                    onClear={() => setFilter("tag", [])}
                  />
                </ToolbarFilter>
              </ToolbarGroup>
            </ToolbarToggleGroup>
            <ToolbarItem
              variant={ToolbarItemVariant.pagination}
              align={{ default: "alignEnd" }}
            >
              <SimplePagination
                count={filteredItems.length}
                params={currentPage}
                onChange={onPageChange}
                isTop={true}
              />
            </ToolbarItem>
          </ToolbarContent>
        </Toolbar>

        <Table>
          <Thead>
            <Tr>
              <Th
                width={30}
                sort={{
                  columnIndex: 0,
                  sortBy: { ...currentSortBy },
                  onSort: onChangeSortBy,
                }}
              >
                Name
              </Th>
              <Th width={10}>Tags</Th>
              <Th width={10}>Incidents</Th>
              <Th width={10}>Story points</Th>
            </Tr>
          </Thead>
          <ConditionalTableBody
            isNoData={filteredItems.length === 0}
            numRenderedColumns={10}
          >
            {pageItems?.map((item, rowIndex) => {
              const isRowExpanded = isSomeCellSelected(item.id, columnKeys);
              return (
                <Tbody key={rowIndex} isExpanded={isRowExpanded}>
                  <Tr>
                    <Td>
                      <Link to={`/applications/${item.id}`}>{item.name}</Link>
                    </Td>
                    <Td
                      compoundExpand={{
                        isExpanded: isCellSelected(item.id, ColumnKey.tags),
                        onToggle: (
                          event: React.MouseEvent,
                          rowIndex: number,
                          colIndex: number,
                          isOpen: boolean,
                          rowData: IRowData,
                          extraData: IExtraData
                        ) => {
                          toggleCellSelected(item.id, ColumnKey.tags);
                        },
                        rowIndex,
                        columnIndex: 1,
                      }}
                    >
                      <TagIcon key="tags" /> {item.tagsFlat.length}
                    </Td>
                    <Td
                      compoundExpand={{
                        isExpanded: isCellSelected(
                          item.id,
                          ColumnKey.incidents
                        ),
                        onToggle: (
                          event: React.MouseEvent,
                          rowIndex: number,
                          colIndex: number,
                          isOpen: boolean,
                          rowData: IRowData,
                          extraData: IExtraData
                        ) => {
                          toggleCellSelected(item.id, ColumnKey.incidents);
                        },
                        rowIndex,
                        columnIndex: 2,
                      }}
                    >
                      <TaskIcon key="incidents" />{" "}
                      {item.issues.reduce(
                        (total, violation) => total + violation.totalIncidents,
                        0
                      )}
                    </Td>
                    <Td>
                      {item.issues.reduce(
                        (total, violation) => total + violation.totalEffort,
                        0
                      )}
                    </Td>
                  </Tr>
                  {isRowExpanded ? (
                    <Tr isExpanded>
                      <Td noPadding colSpan={6}>
                        <div className="pf-v6-u-m-lg">
                          {isCellSelected(item.id, ColumnKey.tags) && (
                            <Split hasGutter isWrappable>
                              {item.tagsFlat.map((e, index) => (
                                <SplitItem key={index}>
                                  <Label isCompact>{e}</Label>
                                </SplitItem>
                              ))}
                            </Split>
                          )}
                          {isCellSelected(item.id, ColumnKey.incidents) && (
                            <DescriptionList
                              isHorizontal
                              isCompact
                              horizontalTermWidthModifier={{
                                default: "12ch",
                                md: "20ch",
                              }}
                            >
                              {Object.entries(issueByCategory[item.id]).map(
                                ([cat, total], index) => (
                                  <DescriptionListGroup key={index}>
                                    <DescriptionListTerm>
                                      {capitalizeFirstLetter(cat)} issues
                                    </DescriptionListTerm>
                                    <DescriptionListDescription>
                                      {total}
                                    </DescriptionListDescription>
                                  </DescriptionListGroup>
                                )
                              )}
                            </DescriptionList>
                          )}
                        </div>
                      </Td>
                    </Tr>
                  ) : null}
                </Tbody>
              );
            })}
          </ConditionalTableBody>
        </Table>

        <SimplePagination
          count={filteredItems.length}
          params={currentPage}
          onChange={onPageChange}
        />
      </PageSection>
    </>
  );
};
