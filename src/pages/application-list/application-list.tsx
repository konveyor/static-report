import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  Button,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Label,
  LabelGroup,
  Modal,
  PageSection,
  PageSectionVariants,
  SearchInput,
  SelectVariant,
  Split,
  SplitItem,
  Stack,
  StackItem,
  Text,
  TextContent,
  ToolbarChip,
  ToolbarChipGroup,
  ToolbarFilter,
  ToolbarGroup,
  ToolbarItem,
  Tooltip,
} from "@patternfly/react-core";
import ExpandIcon from "@patternfly/react-icons/dist/esm/icons/expand-icon";
import FilterIcon from "@patternfly/react-icons/dist/esm/icons/filter-icon";
import InfoCircleIcon from "@patternfly/react-icons/dist/esm/icons/info-circle-icon";
import TagIcon from "@patternfly/react-icons/dist/esm/icons/tag-icon";
import TaskIcon from "@patternfly/react-icons/dist/esm/icons/task-icon";
import {
  ICell,
  IExtraData,
  IRow,
  IRowData,
  cellWidth,
  compoundExpand,
  sortable,
} from "@patternfly/react-table";

import { ApplicationDto } from "@app/api/application";
import {
  compareByCategoryFn,
  IssueCategoryType,
  issueCategoryTypeBeautifier,
} from "@app/api/issues";
import { useApplicationsQuery } from "@app/queries/ruleset";
import { SimpleTableWithToolbar, SimpleSelect } from "@app/shared/components";
import {
  useModal,
  useTable,
  useTableControls,
  useToolbar,
  useCellSelectionState,
} from "@app/shared/hooks";

import "./application-list.css";
import { ApplicationProcessed } from "@app/models/api-enriched";

const DataKey = "DataKey";

enum ColumnKey {
  tags = "tags",
  incidents = "incidents",
}
const columnKeys: ColumnKey[] = Object.values(ColumnKey) as ColumnKey[];

const columns: ICell[] = [
  { title: "Name", transforms: [cellWidth(30), sortable] },
  {
    title: "Tags",
    transforms: [cellWidth(10)],
    cellTransforms: [compoundExpand],
    data: ColumnKey.tags,
  },
  {
    title: "Incidents",
    transforms: [cellWidth(10)],
    cellTransforms: [compoundExpand],
    data: ColumnKey.incidents,
  },
  {
    title: "Story points",
    transforms: [cellWidth(10)],
  },
];

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

const getRow = (rowData: IRowData): ApplicationDto => {
  return rowData[DataKey];
};

const getColumn = (colIndex: number): ColumnKey => {
  return columns[colIndex].data;
};

export const ApplicationList: React.FC = () => {
  const [filterText, setFilterText] = useState("");
  const { filters, setFilter, removeFilter, clearAllFilters } = useToolbar<
    "tag",
    string
  >();

  const applications = useApplicationsQuery();

  const allTags = useMemo(() => {
    const allTags = (applications.data || []).flatMap((f) => f.tagsFlat);
    return Array.from(new Set(allTags)).sort((a, b) => a.localeCompare(b));
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
          item.tags.flatMap((t) => t.tag).some((t) => f === t)
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

  const itemsToRow = (items: ApplicationProcessed[]) => {
    const rows: IRow[] = [];
    items.forEach((item) => {
      rows.push({
        [DataKey]: item,
        isOpen: isSomeCellSelected(item.id, columnKeys),
        cells: [
          {
            title: (
              <>
                <Link to={`/applications/${item.id}`}>{item.name}</Link>
              </>
            ),
          },
          {
            title: (
              <>
                <TagIcon key="tags" /> {item.tagsFlat.length}
              </>
            ),
            props: {
              isOpen: isCellSelected(item.id, ColumnKey.tags),
            },
          },
          {
            title: (
              <>
                <TaskIcon key="incidents" />{" "}
                {item.issues.reduce((total, violation) => total + violation.totalIncidents, 0)}
              </>
            ),
            props: {
              isOpen: isCellSelected(item.id, ColumnKey.incidents),
            },
          },
          {
            title: item.issues.reduce((total, violation) => total + violation.totalEffort, 0),
          },
        ],
      });

      const parentIndex = rows.length - 1;

      rows.push({
        parent: parentIndex,
        compoundParent: 1,
        cells: [
          {
            title: (
              <div className="pf-u-m-lg">
                <Split hasGutter isWrappable>
                  {item.tagsFlat
                    .map((e, index) => (
                      <SplitItem key={index}>
                        <Label isCompact>{e}</Label>
                      </SplitItem>
                    ))}
                </Split>
              </div>
            ),
            props: { colSpan: 6, className: "pf-m-no-padding" },
          },
        ],
      });

      // rows.push({
      //   parent: parentIndex,
      //   compoundParent: 2,
      //   cells: [
      //     {
      //       title: (
      //         <div className="pf-u-m-lg">
      //           <DescriptionList
      //             isHorizontal
      //             isCompact
      //             horizontalTermWidthModifier={{
      //               default: "12ch",
      //               md: "20ch",
      //             }}
      //           >
      //             {Object.keys(item.incidents)
      //               .sort(compareByCategoryFn((e) => e as IssueCategoryType))
      //               .map((incident) => (
      //                 <DescriptionListGroup key={incident}>
      //                   <DescriptionListTerm>
      //                     {issueCategoryTypeBeautifier(
      //                       incident as IssueCategoryType
      //                     )}
      //                   </DescriptionListTerm>
      //                   <DescriptionListDescription>
      //                     {item.incidents[incident]}
      //                   </DescriptionListDescription>
      //                 </DescriptionListGroup>
      //               ))}
      //           </DescriptionList>
      //         </div>
      //       ),
      //       props: { colSpan: 6, className: "pf-m-no-padding" },
      //     },
      //   ],
      // });
    });

    return rows;
  };

  const rows: IRow[] = itemsToRow(pageItems);

  // Reset pagination when application change
  useEffect(() => {
    onPageChange({ page: 1, perPage: currentPage.perPage });
  }, [filters, onPageChange, currentPage.perPage]);

  return (
    <>
      <PageSection variant={PageSectionVariants.light}>
        <TextContent>
          <Text component="h1">Applications</Text>
          <Text component="small">
            This report lists all analyzed applications. Select an individual
            application to show more details.
          </Text>
        </TextContent>
      </PageSection>
      <PageSection variant={PageSectionVariants.default}>
        <SimpleTableWithToolbar
          className="application-list-table"
          hasTopPagination
          hasBottomPagination
          totalCount={filteredItems.length}
          // Expand
          onExpand={(
            event: React.MouseEvent,
            rowIndex: number,
            colIndex: number,
            isOpen: boolean,
            rowData: IRowData,
            extraData: IExtraData
          ) => {
            const row = getRow(rowData);
            const columnKey = getColumn(colIndex);
            toggleCellSelected(row.id, columnKey);
          }}
          // Sorting
          sortBy={
            currentSortBy || { index: undefined, defaultDirection: "asc" }
          }
          onSort={onChangeSortBy}
          // Pagination
          currentPage={currentPage}
          onPageChange={onPageChange}
          // Table
          rows={rows}
          cells={columns}
          // Fech data
          isLoading={applications.isFetching}
          loadingVariant="skeleton"
          fetchError={applications.isError}
          // Toolbar filters
          toolbarClearAllFilters={clearAllFilters}
          filtersApplied={filterText.trim().length > 0}
          toolbarToggle={
            <>
              <ToolbarItem variant="search-filter">
                <SearchInput
                  value={filterText}
                  onChange={setFilterText}
                  onClear={() => {
                    setFilterText("");
                  }}
                />
              </ToolbarItem>
              <ToolbarGroup variant="filter-group">
                <ToolbarFilter
                  chips={filters.get("tag")}
                  deleteChip={(
                    category: string | ToolbarChipGroup,
                    chip: ToolbarChip | string
                  ) => removeFilter("tag", chip)}
                  deleteChipGroup={() => setFilter("tag", [])}
                  categoryName={{ key: "tag", name: "Tag" }}
                >
                  <SimpleSelect
                    width={250}
                    maxHeight={300}
                    toggleIcon={<FilterIcon />}
                    variant={SelectVariant.checkbox}
                    aria-label="tag"
                    aria-labelledby="tag"
                    placeholderText="Tag"
                    value={filters.get("tag")}
                    options={allTags}
                    onChange={(option) => {
                      const optionValue = option as string;

                      const elementExists = (filters.get("tag") || []).some(
                        (f) => f === optionValue
                      );
                      let newElements: string[];
                      if (elementExists) {
                        newElements = (filters.get("tag") || [])
                          .filter((f) => f !== optionValue)
                          .map((f) => f);
                      } else {
                        newElements = [
                          ...(filters.get("tag") || []),
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
            </>
          }
        />
      </PageSection>
    </>
  );
};
