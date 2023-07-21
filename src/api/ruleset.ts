import internal from "stream";

export const ISSUE_CATEGORIES = [
    "mandatory",
    "optional",
    "potential", 
] as const;

export type IssueCatType = typeof ISSUE_CATEGORIES[number];

export interface RulesetDto {
    name: string,
    description: string,
    tags: string[],
    violations: {
        [key: string]: {}
    }
}

export interface ViolationDto {
    description: string,
    category: IssueCatType,
    labels: string[],
    incidents: IncidentDto[],
    links: LinkDto[],
    effort: number,
}

export interface IncidentDto {
    uri: string,
    message: string,
    codeSnip: string,
    lineNumber: number,
    variables: {
        [key: string]: Object,
    }
}

export interface LinkDto {
    url: string,
    title: string,
}