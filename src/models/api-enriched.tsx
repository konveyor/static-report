import { ViolationDto, ApplicationDto, IncidentDto } from "@app/api/output";

export interface ApplicationProcessed extends ApplicationDto {
  issues: ViolationProcessed[];
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
  files: {
    [key: string]: IncidentDto[], 
  }
}