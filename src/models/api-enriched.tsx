import { 
  IncidentDto,
  LinkDto,
  TagDto
} from "@app/api/report";

export interface ApplicationProcessed {
  id: string;
  name: string;
  issues: IssueProcessed[];
  dependencies: DependencyProcessed[];
  tags: TagDto[];
  tagsFlat: string[];
}

export interface IssueProcessed {
  id: string;
  appID: string;
  ruleID: string;
  name: string;
  effort: number;
  links: LinkDto[];
  description: string;
  totalEffort: number;
  totalIncidents: number;
  category: IssueCatType;
  sourceTechnologies: string[];
  targetTechnologies: string[];
  files: FileProcessed[];
}

export interface FileProcessed {
  displayName: string;
  name: string;
  isFound: boolean;
  codeSnip?: string;
  incidents: IncidentDto[];
}

export interface DependencyProcessed {
  source: string;
  language: string;
  provider: string;
  sha: string;
  name: string;
  version: string;
  indirect: boolean;
  labels: string[];
  fileURIPrefix: string;
}

export const ISSUE_CATEGORIES = [
  "mandatory",
  "optional",
  "potential", 
] as const;

export type IssueCatType = typeof ISSUE_CATEGORIES[number];

const getCategoryPriority = (category: IssueCatType) => {
  switch (category) {
    case "mandatory":
      return 1;
    case "optional":
      return 2;
    case "potential":
      return 3;
    default:
      return 0;
  }
};

export function compareByCategoryFn<T>(
  categoryExtractor: (elem: T) => IssueCatType
) {
  return (a: T, b: T) => {
    return (
      getCategoryPriority(categoryExtractor(a)) -
      getCategoryPriority(categoryExtractor(b))
    );
  };
}

export function compareByCategoryAndNameFn<T>(
  categoryFn: (elem: T) => IssueCatType,
  nameFn: (elem: T) => string
) {
  return (a: T, b: T) => {
    return (
      getCategoryPriority(categoryFn(a)) - getCategoryPriority(categoryFn(b)) ||
      nameFn(a).localeCompare(nameFn(b))
    );
  };
}