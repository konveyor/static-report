export interface ApplicationDto {
    id: string;
    name: string;
    location: string;
    rulesets: RulesetDto[];
    dependencies: DependencyDto[];
}

export interface RulesetDto {
    name: string;
    description: string;
    tags: string[];
    violations: {
        [key: string]: ViolationDto;
    }
}

export interface ViolationDto {
    description: string;
    category: IssueCatType;
    labels: string[];
    incidents: IncidentDto[];
    links: LinkDto[];
    effort: number;
}

export interface IncidentDto {
    uri: string;
    message: string;
    codeSnip: string;
    lineNumber: number;
    variables: {
        [key: string]: Object;
    }
}

export interface LinkDto {
    url: string;
    title: string;
}

export interface DependencyDto {
  name: string;
  version: string;
  indirect: boolean;
  resolvedIdentifier: string;
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