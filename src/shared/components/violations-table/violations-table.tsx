import React, { useCallback, useEffect, useMemo, useState } from "react";

import { useSelectionState } from "@migtools/lib-ui";
import {
  Bullseye,
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  Label,
  Modal,
  SearchInput,
  SelectVariant,
  Split,
  SplitItem,
  Title,
  ToolbarChip,
  ToolbarChipGroup,
  ToolbarFilter,
  ToolbarGroup,
  ToolbarItem,
} from "@patternfly/react-core";
import ArrowUpIcon from "@patternfly/react-icons/dist/esm/icons/arrow-up-icon";
import {
  ICell,
  IRow,
  IRowData,
  cellWidth,
  sortable,
  truncate,
} from "@patternfly/react-table";
import { useDebounce } from "usehooks-ts";

import { compareByCategoryFn } from "@app/models/api-enriched";
import { ALL_APPLICATIONS_ID } from "@app/Constants";
import { FileProcessed, IssueProcessed } from "@app/models/api-enriched";
import { useAllApplications } from "@app/queries/report";
import {
  SimpleTableWithToolbar,
  SimpleSelect,
  OptionWithValue,
  FileEditor,
} from "@app/shared/components";
import {
  useModal,
  useTable,
  useTableControls,
  useToolbar,
} from "@app/shared/hooks";

import { IssueOverview } from "./components/issue-overview";

export interface TableData extends IssueProcessed {}

const areRowsEquals = (a: TableData, b: TableData) => {
  return a.id === b.id;
};

const toOption = (option: string | ToolbarChip): OptionWithValue => {
  if (typeof option === "string") {
    const toStringFn = () => option;
    return {
      value: option,
      toString: toStringFn,
      compareTo: (other: string | OptionWithValue) => {
        return typeof other === "string"
          ? toStringFn().toLowerCase().includes(other.toLocaleLowerCase())
          : option === other.value;
      },
    };
  } else {
    const toStringFn = () => option.node as string;
    return {
      value: option.key,
      toString: toStringFn,
      compareTo: (other: string | OptionWithValue) => {
        return typeof other === "string"
          ? toStringFn().toLowerCase().includes(other.toLowerCase())
          : option.key === other.value;
      },
    };
  }
};

const toToolbarChip = (option: OptionWithValue): ToolbarChip => {
  return {
    key: option.value,
    node: option.toString(),
  };
};

const DataKey = "DataKey";

const columns: ICell[] = [
  {
    title: "Issue",
    transforms: [cellWidth(35), sortable],
    cellTransforms: [],
  },
  {
    title: "Category",
    transforms: [cellWidth(10)],
  },
  {
    title: "Source",
    transforms: [cellWidth(10)],
  },
  {
    title: "Target",
    transforms: [cellWidth(10)],
  },
  {
    title: "Effort",
    transforms: [cellWidth(15)],
    cellTransforms: [truncate],
  },
  {
    title: "Total incidents",
    transforms: [cellWidth(10), sortable],
  },
  {
    title: "Total effort",
    transforms: [cellWidth(10), sortable],
  },
];

export const compareByColumnIndex = (
  a: IssueProcessed,
  b: IssueProcessed,
  columnIndex?: number
) => {
  switch (columnIndex) {
    case 1: // name
      return a.id.localeCompare(b.id);
    case 6: // Total incidents
      return a.totalIncidents - b.totalIncidents;
    case 7: // Total storypoints
      return a.totalEffort - b.totalEffort;
    default:
      return 0;
  }
};

const getRow = (rowData: IRowData): TableData => {
  return rowData[DataKey];
};

interface SelectedFile {
  file: FileProcessed;
  issue: IssueProcessed;
}

export interface IViolationsTableProps {
  applicationId?: string;
}

export const ViolationsTable: React.FC<IViolationsTableProps> = ({ applicationId }) => {
  const allApplications = useAllApplications();

  // Filters
  const [filterText, setFilterText] = useState("");
  const { filters, setFilter, removeFilter, clearAllFilters } = useToolbar<
    "category" | "effort" | "sourceTechnology" | "targetTechnology",
    ToolbarChip
  >();

  const debouncedFilterText = useDebounce<string>(filterText, 250);
  const debouncedFilters = useDebounce<
    Map<
      "category" | "effort" | "sourceTechnology" | "targetTechnology",
      ToolbarChip[]
    >
  >(filters, 100);


  const {
    data: fileModalData,
    isOpen: isFileModalOpen,
    action: fileModalAction,
    open: openFileModal,
    close: closeFileModal,
  } = useModal<"showFile", SelectedFile>();

  const issues: TableData[] = useMemo(() => {
    if (
      !allApplications.data ||
      applicationId === undefined
    ) {
      return [];
    }

    return (
      applicationId === ALL_APPLICATIONS_ID ? 
        allApplications.data?.flatMap((a) => a.issues) : 
        allApplications.data?.find((f) => f.id === applicationId)?.issues || []
    );
  }, [allApplications.data, applicationId]);

  const technologies = useMemo(() => {
    const sources = new Set<string>();
    const targets = new Set<string>();

    issues.forEach((elem) => {
      elem.sourceTechnologies?.forEach((e) => sources.add(e));
      elem.targetTechnologies?.forEach((e) => targets.add(e));
    });

    return { source: Array.from(sources), target: Array.from(targets) };
  }, [issues]);

  const categories = useMemo(() => {
    const allCategories = (issues || [])
      .map((i) => i.category);
    return Array.from(new Set(allCategories)).sort(
      compareByCategoryFn((e) => e)
    );
  }, [issues]);

  const efforts = useMemo(() => {
    const allEfforts = (issues || [])
      .map((e) => e.effort.toString());
    return Array.from(new Set(allEfforts)).sort();
  }, [issues]);

  const {
    isItemSelected: isRowExpanded,
    toggleItemSelected: toggleRowExpanded,
  } = useSelectionState<TableData>({
    items: issues,
    isEqual: areRowsEquals,
  });

  const {
    page: currentPage,
    sortBy: currentSortBy,
    changePage: onPageChange,
    changeSortBy: onChangeSortBy,
  } = useTableControls();

  const filterItem = useCallback(
    (item: TableData) => {
      let isFilterTextFilterCompliant = true;
      if (debouncedFilterText && debouncedFilterText.trim().length > 0) {
        isFilterTextFilterCompliant =
          item.name.toLowerCase().indexOf(debouncedFilterText.toLowerCase()) !==
          -1;
      }

      let isCategoryFilterCompliant = true;
      const selectedCategories = debouncedFilters.get("category") || [];
      if (selectedCategories.length > 0) {
        isCategoryFilterCompliant = selectedCategories.some(
          (f) => item.category === f.key
        );
      }

      let isLevelOfEffortCompliant = true;
      const selectedLevelOfEfforts =
        debouncedFilters.get("effort") || [];
      if (selectedLevelOfEfforts.length > 0) {
        isLevelOfEffortCompliant = selectedLevelOfEfforts.some(
          (f) => item.effort.toString() === f.key
        );
      }

      let isSourceCompliant = true;
      const selectedSources = debouncedFilters.get("sourceTechnology") || [];
      if (selectedSources.length > 0) {
        isSourceCompliant = selectedSources.some((f) => {
          return item.sourceTechnologies?.includes(f.key);
        });
      }

      let isTargetCompliant = true;
      const selectedTargets = debouncedFilters.get("targetTechnology") || [];
      if (selectedTargets.length > 0) {
        isTargetCompliant = selectedTargets.some((f) => {
          return item.targetTechnologies?.includes(f.key);
        });
      }

      return (
        isFilterTextFilterCompliant &&
        isCategoryFilterCompliant &&
        isLevelOfEffortCompliant &&
        isSourceCompliant &&
        isTargetCompliant
      );
    },
    [debouncedFilterText, debouncedFilters]
  );

  const { pageItems, filteredItems } = useTable<TableData>({
    items: issues,
    currentPage: currentPage,
    currentSortBy: currentSortBy,
    compareToByColumn: compareByColumnIndex,
    filterItem: filterItem,
  });

  const rows: IRow[] = useMemo(() => {
    const rows: IRow[] = [];
    pageItems.forEach((item) => {
      const isExpanded = isRowExpanded(item);
      rows.push({
        [DataKey]: item,
        isOpen: isExpanded,
        cells: [
          {
            title: item.name,
          },
          {
            title: item.category,
          },
          {
            title: (
              <>
                <Split hasGutter>
                  {item.sourceTechnologies?.map((technology) => (
                    <SplitItem key={technology}>
                      <Label isCompact color="blue">
                        {technology}
                      </Label>
                    </SplitItem>
                  ))}
                </Split>
              </>
            ),
          },
          {
            title: (
              <>
                <Split hasGutter>
                  {item.targetTechnologies?.map((technology) => (
                    <SplitItem key={technology}>
                      <Label isCompact color="blue">
                        {technology}
                      </Label>
                    </SplitItem>
                  ))}
                </Split>
              </>
            ),
          },
          {
            title: item.effort.toString(),
          },
          {
            title: item.totalIncidents,
          },
          {
            title: item.totalEffort,
          },
        ],
      });

      // Expanded area
      if (isExpanded) {
        rows.push({
          [DataKey]: item,
          parent: rows.length - 1,
          fullWidth: true,
          cells: [
            {
              title: (
                <div className="pf-u-m-sm">
                  <IssueOverview
                    issue={item}
                    onShowFile={(file, issue) =>
                      openFileModal("showFile", {
                        file,
                        issue,
                      })
                    }
                  />
                </div>
              ),
            },
          ],
        });
      }
    });

    return rows;
  }, [pageItems, isRowExpanded, openFileModal]);


  // Reset pagination when application change
  useEffect(() => {
    onPageChange({ page: 1, perPage: currentPage.perPage });
  }, [
    debouncedFilterText,
    debouncedFilters,
    onPageChange,
    currentPage.perPage,
  ]);

  return (
    <>
      <>
        {applicationId === undefined ? (
          <Bullseye>
            <EmptyState>
              <EmptyStateIcon icon={ArrowUpIcon} />
              <Title headingLevel="h4" size="lg">
                Select an application
              </Title>
              <EmptyStateBody>
                Select an application whose data you want to get access to.
              </EmptyStateBody>
            </EmptyState>
          </Bullseye>
        ) : (
          <SimpleTableWithToolbar
            rowWrapper={(props) => {
              const row = getRow(props.row as IRowData);
              const isNotExpandedRow = !props.row?.isExpanded;
              return (
                <tr key={`${row.name}${isNotExpandedRow ? "" : "-expanded"}`}>
                  {props.children}
                </tr>
              );
            }}
            hasTopPagination
            hasBottomPagination
            totalCount={filteredItems.length}
            // Expand
            onCollapse={(_event, _rowIndex, _isOpen, rowData) => {
              const issue = getRow(rowData);
              toggleRowExpanded(issue);
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
            isLoading={allApplications.isLoading}
            loadingVariant="skeleton"
            fetchError={allApplications.isError}
            // Toolbar filters
            toolbarClearAllFilters={clearAllFilters}
            filtersApplied={filterText.trim().length > 0}
            toolbarToggle={
              <>
                <ToolbarItem variant="search-filter">
                  <SearchInput
                    value={filterText}
                    onChange={setFilterText}
                    onClear={() => setFilterText("")}
                  />
                </ToolbarItem>
                <ToolbarGroup variant="filter-group">
                  <ToolbarFilter
                    chips={filters.get("category")}
                    deleteChip={(
                      category: string | ToolbarChipGroup,
                      chip: ToolbarChip | string
                    ) => removeFilter("category", chip)}
                    deleteChipGroup={() => setFilter("category", [])}
                    categoryName={{ key: "category", name: "Category" }}
                  >
                    <SimpleSelect
                      maxHeight={300}
                      variant={SelectVariant.checkbox}
                      aria-label="category"
                      aria-labelledby="category"
                      placeholderText="Category"
                      value={filters.get("category")?.map(toOption)}
                      options={categories.map(toOption)}
                      onChange={(option) => {
                        const optionValue = option as OptionWithValue<string>;

                        const elementExists = (
                          filters.get("category") || []
                        ).some((f) => f.key === optionValue.value);
                        let newElements: ToolbarChip[];
                        if (elementExists) {
                          newElements = (filters.get("category") || []).filter(
                            (f) => f.key !== optionValue.value
                          );
                        } else {
                          newElements = [
                            ...(filters.get("category") || []),
                            toToolbarChip(optionValue),
                          ];
                        }

                        setFilter("category", newElements);
                      }}
                      hasInlineFilter
                      onClear={() => setFilter("category", [])}
                    />
                  </ToolbarFilter>
                </ToolbarGroup>
                <ToolbarGroup variant="filter-group">
                  <ToolbarFilter
                    chips={filters.get("effort")}
                    deleteChip={(
                      category: string | ToolbarChipGroup,
                      chip: ToolbarChip | string
                    ) => removeFilter("effort", chip)}
                    deleteChipGroup={() => setFilter("effort", [])}
                    categoryName={{
                      key: "effort",
                      name: "Effort",
                    }}
                  >
                    <SimpleSelect
                      maxHeight={300}
                      variant={SelectVariant.checkbox}
                      aria-label="effort"
                      aria-labelledby="effort"
                      placeholderText="Effort"
                      value={filters.get("effort")?.map(toOption)}
                      options={efforts.map(toOption)}
                      onChange={(option) => {
                        const optionValue = option as OptionWithValue<string>;

                        const elementExists = (
                          filters.get("effort") || []
                        ).some((f) => f.key === optionValue.value);
                        let newElements: ToolbarChip[];
                        if (elementExists) {
                          newElements = (
                            filters.get("effort") || []
                          ).filter((f) => f.key !== optionValue.value);
                        } else {
                          newElements = [
                            ...(filters.get("effort") || []),
                            toToolbarChip(optionValue),
                          ];
                        }

                        setFilter("effort", newElements);
                      }}
                      hasInlineFilter
                      onClear={() => setFilter("effort", [])}
                    />
                  </ToolbarFilter>
                </ToolbarGroup>
                <ToolbarGroup variant="filter-group">
                  {technologies.source.length > 0 && (
                    <ToolbarFilter
                      chips={filters.get("sourceTechnology")}
                      deleteChip={(
                        category: string | ToolbarChipGroup,
                        chip: ToolbarChip | string
                      ) => removeFilter("sourceTechnology", chip)}
                      deleteChipGroup={() => setFilter("sourceTechnology", [])}
                      categoryName={{
                        key: "sourceTechnology",
                        name: "Source",
                      }}
                    >
                      <SimpleSelect
                        maxHeight={300}
                        variant={SelectVariant.checkbox}
                        aria-label="sourceTechnology"
                        aria-labelledby="sourceTechnology"
                        placeholderText="Source"
                        value={filters.get("sourceTechnology")?.map(toOption)}
                        options={technologies.source.map(toOption)}
                        onChange={(option) => {
                          const optionValue = option as OptionWithValue<string>;

                          const elementExists = (
                            filters.get("sourceTechnology") || []
                          ).some((f) => f.key === optionValue.value);
                          let newElements: ToolbarChip[];
                          if (elementExists) {
                            newElements = (
                              filters.get("sourceTechnology") || []
                            ).filter((f) => f.key !== optionValue.value);
                          } else {
                            newElements = [
                              ...(filters.get("sourceTechnology") || []),
                              toToolbarChip(optionValue),
                            ];
                          }

                          setFilter("sourceTechnology", newElements);
                        }}
                        hasInlineFilter
                        onClear={() => setFilter("sourceTechnology", [])}
                      />
                    </ToolbarFilter>
                  )}
                  {technologies.target.length > 0 && (
                    <ToolbarFilter
                      chips={filters.get("targetTechnology")}
                      deleteChip={(
                        category: string | ToolbarChipGroup,
                        chip: ToolbarChip | string
                      ) => removeFilter("targetTechnology", chip)}
                      deleteChipGroup={() => setFilter("targetTechnology", [])}
                      categoryName={{
                        key: "targetTechnology",
                        name: "Target",
                      }}
                    >
                      <SimpleSelect
                        maxHeight={300}
                        variant={SelectVariant.checkbox}
                        aria-label="targetTechnology"
                        aria-labelledby="targetTechnology"
                        placeholderText="Target"
                        value={filters.get("targetTechnology")?.map(toOption)}
                        options={technologies.target.map(toOption)}
                        onChange={(option) => {
                          const optionValue = option as OptionWithValue<string>;

                          const elementExists = (
                            filters.get("targetTechnology") || []
                          ).some((f) => f.key === optionValue.value);
                          let newElements: ToolbarChip[];
                          if (elementExists) {
                            newElements = (
                              filters.get("targetTechnology") || []
                            ).filter((f) => f.key !== optionValue.value);
                          } else {
                            newElements = [
                              ...(filters.get("targetTechnology") || []),
                              toToolbarChip(optionValue),
                            ];
                          }

                          setFilter("targetTechnology", newElements);
                        }}
                        hasInlineFilter
                        onClear={() => setFilter("targetTechnology", [])}
                      />
                    </ToolbarFilter>
                  )}
                </ToolbarGroup>
              </>
            }
          />
        )}
      </>

      <Modal
        title={`File ${fileModalData?.file?.name || ""}`}
        isOpen={isFileModalOpen && fileModalAction === "showFile"}
        onClose={closeFileModal}
        variant="default"
        position="top"
        disableFocusTrap
        actions={[
          <Button key="close" variant="primary" onClick={closeFileModal}>
            Close
          </Button>,
        ]}
      >
        {fileModalData?.file && (
          <FileEditor
            file={fileModalData.file}
            issue={fileModalData.issue}
          />
        )}
      </Modal>
    </>
  );
};
