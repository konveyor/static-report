import React, { useMemo, useState, useEffect, useCallback } from "react";


import { useSelectionState } from "@app/shared/hooks/useSelectionState";
import {
  Bullseye,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  Label,
  Split,
  SplitItem,
  SelectVariant,
  SearchInput,
  Title,
  ToolbarItem,
  ToolbarChip,
  ToolbarChipGroup,
  ToolbarFilter,
  ToolbarGroup,
} from "@patternfly/react-core";
import ArrowUpIcon from "@patternfly/react-icons/dist/esm/icons/arrow-up-icon";
import {
  IAction,
  ICell,
  IRow,
  IRowData,
  cellWidth,
  sortable,
  truncate,
} from "@patternfly/react-table";
import { useDebounce } from "usehooks-ts";


import { DependencyDto } from "@app/api/report";
import { ALL_APPLICATIONS_ID } from "@app/Constants";
import { useAllApplications } from "@app/queries/report";
import { SimpleTableWithToolbar, SimpleSelect, OptionWithValue } from "@app/shared/components";
import { useTable, useTableControls, useToolbar } from "@app/shared/hooks";

const areDependenciesEquals = (a: DependencyDto, b: DependencyDto) => {
  return a.name === b.name && a.version === b.version && a.resolvedIdentifier === b.resolvedIdentifier;
};

const DataKey = "DataKey";

const columns: ICell[] = [
  {
    title: "Name",
    transforms: [cellWidth(50), sortable],
    cellTransforms: [truncate],
  },
  {
    title: "Labels",
    transforms: [cellWidth(30)],
  },
  {
    title: "Version",
    transforms: [cellWidth(10)],
    cellTransforms: [truncate],
  },
  {
    title: "Relation",
    transforms: [cellWidth(10), sortable],
    cellTransforms: [truncate],
  },
];

const compareToByColumn = (
  a: DependencyDto,
  b: DependencyDto,
  columnIndex?: number
) => {
  switch (columnIndex) {
    case 1: // name
      return a.name.localeCompare(b.name);
    case 3: // version
      return a.version === b.version ? 0 : 1
    case 4: // indirect
      return a.indirect === b.indirect ? 0 : 1
    default:
      return 0;
  }
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

const getRow = (rowData: IRowData): DependencyDto => {
  return rowData[DataKey];
};

export interface IDependenciesTableProps {
  applicationId?: string;
}

export const DependenciesTable: React.FC<IDependenciesTableProps> = ({
  applicationId,
}) => {
  const allApplicationsQuery = useAllApplications();

  // Filters
  const [filterText, setFilterText] = useState("");
  const { filters, setFilter, removeFilter, clearAllFilters } = useToolbar<
    "labels" | "relationship",
    ToolbarChip
  >();

  const debouncedFilterText = useDebounce<string>(filterText, 250);
  const debouncedFilters = useDebounce<
    Map<
      "labels" | "relationship",
      ToolbarChip[]
    >
  >(filters, 100);

  const dependencies = useMemo(() => {
    if (
      !allApplicationsQuery.data ||
      applicationId === undefined
    ) {
      return [];
    }
    return (
      applicationId === ALL_APPLICATIONS_ID ? 
      allApplicationsQuery.data?.flatMap((a) => a.dependencies || []) : 
      allApplicationsQuery.data?.find((f) => f.id === applicationId)?.dependencies || []
    );
  }, [allApplicationsQuery.data, applicationId]);

  const allLabels: string[] = useMemo(() => {
    return Array.from(new Set(dependencies?.flatMap((d) => d.labels)))
  }, [dependencies])

  // Rows
  const {
    toggleItemSelected: toggleRowExpanded,
  } = useSelectionState<DependencyDto>({
    items: dependencies,
    isEqual: areDependenciesEquals,
  });

  const {
    page: currentPage,
    sortBy: currentSortBy,
    changePage: onPageChange,
    changeSortBy: onChangeSortBy,
  } = useTableControls();

  const filterItem = useCallback(
    (item: DependencyDto) => {
      let isFilterTextFilterCompliant = true;
      if (debouncedFilterText && debouncedFilterText.trim().length > 0) {
        isFilterTextFilterCompliant =
          item.name.toLowerCase().indexOf(debouncedFilterText.toLowerCase()) !==
          -1;
      }

      let isLabelFilterCompliant = true;
      const selectedLabels = debouncedFilters.get("labels") || [];
      if (selectedLabels.length > 0) {
        isLabelFilterCompliant = selectedLabels.some(
          (f) => item.labels?.includes(f.key)
        );
      }

      let isRelationshipFilterCompliant = true;
      const selectedRelation = debouncedFilters.get("relationship") || [];
      if (selectedRelation.length > 0) {
        isLabelFilterCompliant = selectedRelation.some(
          (f) => (f.key === "Direct" && !item.indirect) || (f.key === "Indirect" && item.indirect)
        );
      }

      return (
        isFilterTextFilterCompliant &&
        isLabelFilterCompliant &&
        isRelationshipFilterCompliant
      );
    },
    [debouncedFilterText, debouncedFilters]
  );

  const { pageItems, filteredItems } = useTable<DependencyDto>({
    items: dependencies,
    currentPage,
    currentSortBy,
    compareToByColumn,
    filterItem,
  });

  const itemsToRow = (items: DependencyDto[]) => {
    const rows: IRow[] = [];
    items.forEach((item) => {
      rows.push({
        [DataKey]: item,
        cells: [
          {
            title: item.name,
          },
          {
            title: (
              <>
                <Split hasGutter>
                  {item.labels?.map((label, index) => (
                    <SplitItem key={index}>
                      <Label isCompact color="blue">
                        {label.replace("konveyor.io/source=", "")}
                      </Label>
                    </SplitItem>
                  ))}
                </Split>
              </>
            ),
          },
          {
            title: item.version,
          },
          {
            title: item.indirect ? "Indirect" : "Direct",
          },
        ],
      });
    });

    return rows;
  };

  const rows: IRow[] = itemsToRow(pageItems);
  const actions: IAction[] = [];

  // Reset pagination when application change
  useEffect(() => {
    onPageChange({ page: 1, perPage: currentPage.perPage });
  }, [applicationId, onPageChange, currentPage.perPage]);

  return (
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
          actions={actions}
          // Fech data
          isLoading={allApplicationsQuery.isFetching}
          loadingVariant="skeleton"
          fetchError={allApplicationsQuery.isError}
          // Toolbar filters
          filtersApplied={filterText.trim().length > 0}
          toolbarClearAllFilters={clearAllFilters}
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
                    chips={filters.get("labels")}
                    deleteChip={(
                      category: string | ToolbarChipGroup,
                      chip: ToolbarChip | string
                    ) => removeFilter("labels", chip)}
                    deleteChipGroup={() => setFilter("labels", [])}
                    categoryName={{ key: "labels", name: "Labels" }}
                  >
                    <SimpleSelect
                      maxHeight={300}
                      variant={SelectVariant.checkbox}
                      aria-label="labels"
                      aria-labelledby="labels"
                      placeholderText="Labels"
                      value={filters.get("labels")?.map(toOption)}
                      options={allLabels.map(toOption)}
                      onChange={(option) => {
                        const optionValue = option as OptionWithValue<string>;

                        const elementExists = (
                          filters.get("labels") || []
                        ).some((f) => f.key === optionValue.value);
                        let newElements: ToolbarChip[];
                        if (elementExists) {
                          newElements = (filters.get("labels") || []).filter(
                            (f) => f.key !== optionValue.value
                          );
                        } else {
                          newElements = [
                            ...(filters.get("labels") || []),
                            toToolbarChip(optionValue),
                          ];
                        }

                        setFilter("labels", newElements);
                      }}
                      hasInlineFilter
                      onClear={() => setFilter("labels", [])}
                    />
                  </ToolbarFilter>
                </ToolbarGroup>
                <ToolbarGroup variant="filter-group">
                  <ToolbarFilter
                    chips={filters.get("relationship")}
                    deleteChip={(
                      category: string | ToolbarChipGroup,
                      chip: ToolbarChip | string
                    ) => removeFilter("relationship", chip)}
                    deleteChipGroup={() => setFilter("relationship", [])}
                    categoryName={{ key: "relationship", name: "Relation" }}
                  >
                    <SimpleSelect
                      maxHeight={300}
                      variant={SelectVariant.checkbox}
                      aria-label="relationship"
                      aria-labelledby="relationship"
                      placeholderText="Relation"
                      value={filters.get("relationship")?.map(toOption)}
                      options={["Direct", "Indirect"].map(toOption)}
                      onChange={(option) => {
                        const optionValue = option as OptionWithValue<string>;

                        const elementExists = (
                          filters.get("relationship") || []
                        ).some((f) => f.key === optionValue.value);
                        let newElements: ToolbarChip[];
                        if (elementExists) {
                          newElements = (filters.get("relationship") || []).filter(
                            (f) => f.key !== optionValue.value
                          );
                        } else {
                          newElements = [
                            ...(filters.get("relationship") || []),
                            toToolbarChip(optionValue),
                          ];
                        }

                        setFilter("relationship", newElements);
                      }}
                      hasInlineFilter
                      onClear={() => setFilter("relationship", [])}
                    />
                  </ToolbarFilter>
                </ToolbarGroup>
            </>
          }
        />
      )}
    </>
  );
};
