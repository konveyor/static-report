import { ViolationDto, ApplicationDto, IncidentDto, DependencyDto } from "@app/api/report";

export interface ApplicationProcessed extends ApplicationDto {
  issues: ViolationProcessed[];
  dependencies: DependencyProcessed[];
  tags: TagProcessed[];
  tagsFlat: string[];
}

export interface TagProcessed {
  tag: string;
  category: string;
}

export interface ViolationProcessed extends ViolationDto {
  id: string;
  appID: string;
  name: string;
  ruleID: string;
  rule: string;
  totalIncidents: number;
  totalEffort: number;
  sourceTechnologies: string[];
  targetTechnologies: string[];
  files: FileProcessed[];
}

export interface FileProcessed {
  displayName: string;
  name: string;
  isLocal: boolean;
  codeSnip?: string;
  incidents: IncidentDto[];
}

export interface DependencyProcessed extends DependencyDto {
  source: string;
  language: string;
  fileURI: string;
  provider: string;
}