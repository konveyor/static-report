export interface ApplicationDto {
    id: string;
    name: string;
    rulesets: RulesetDto[];
    files: FileDto;
    depItems: DependencyItemDto[];
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
    category: string;
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

export interface DependencyItemDto {
  fileURI: string;
  provider: string;
  dependencies: DependencyDto[];
}

export interface DependencyDto {
  name: string;
  version: string;
  indirect: boolean;
  resolvedIdentifier: string;
  labels: string[];
  fileURIPrefix: string;
}

export interface FileDto {
  [filename: string]: string;
}

