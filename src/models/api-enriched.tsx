import { IssueCategoryType, IssueDto } from "@app/api/issues";
import { RuleDto } from "@app/api/rule";
import { ViolationDto, AppDto } from "@app/api/ruleset";
import { TechnologyGroup } from "@app/api/technologies";

export interface ApplicationIssuesProcessed {
  applicationId: string;
  issues: IssueProcessed[];
}

export interface IssueProcessed extends IssueDto {
  category: IssueCategoryType;
}

export interface RuleProcessed extends RuleDto {
  phase: string;
}

export interface TechnologyTagValue {
  [tagName: string]: number;
}

export interface TechnologyValueProcessed {
  total: number;
  tags: TechnologyTagValue;
}

export interface TechnologyGroupValueProcessed {
  [technologyName: string]: TechnologyValueProcessed;
}

export type TechnologyGroupsProcessed = {
  [groupName in TechnologyGroup]: TechnologyGroupValueProcessed;
};

export interface ApplicationTechnologiesProcessed {
  applicationId: string;
  technologyGroups: TechnologyGroupsProcessed;
}

export interface ApplicationProcessed extends AppDto {
  issues: ViolationProcessed[];
  tags: TagProcessed[];
}

export interface TagProcessed {
  tag: string;
  category?: string;
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
}