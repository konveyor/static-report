import { useCallback } from "react";
import { AxiosError } from "axios";

import {
  ReportDto,
  IssueDto,
  RulesetDto,
  FileDto,
  DependencyDto,
  TagDto
} from "@app/api/report";
import { 
  ApplicationProcessed,
  DependencyProcessed,
  IssueProcessed,
  IssueCatType
} from "@app/models/api-enriched";
import { useMockableQuery } from "./helpers";
import { MOCK_APPS } from "./mocks/report.mock";
import { DispersedFile, addIncidentToDispersedFile, getCodeSnip, organizeDispersedFile } from "@app/models/file";
import { useQuery } from "@tanstack/react-query";


export const useFileQuery = (uri: string, appId: string, enabled: boolean) => {
  const getFile = useCallback((apps: ReportDto[]): string => {
      const app = apps.find((a) => a.id === appId)
      const content = app ? app.files ? app.files[uri] : "" : ""
      return content
  }, [uri, appId]);
  return useMockableQuery<ReportDto[], AxiosError, string>(
    {
      queryKey: ["apps", uri],
      select: getFile,
      enabled,
    },
    MOCK_APPS,
    (window as any)["apps"],
  );
}

const filterLabelsWithPrefix = (labels: string[], prefix: string): string[] => {
  return Array.from(
    new Set(labels
      .filter(s => s.startsWith(prefix))
      .map(s => s.slice(s.indexOf("=")+1))))
}

// converts violations from analyzer output to IssueProcessed[]
const issuesFromRulesetsDto = (appID: string, filesRaw: FileDto, rulesets: RulesetDto[]): IssueProcessed[] => {
  return rulesets.flatMap((rs) => {
    return Object.keys(rs.violations || {}).map((ruleID) => {
      const violation: IssueDto = rs.violations[ruleID];
      const totalIncidents: number = violation.incidents.length;
      const totalEffort: number = (violation.effort ? violation.effort : 0) * totalIncidents;
      const name: string = violation.description?.split("\n")[0];
      const sourceTechnologies: string[] = filterLabelsWithPrefix(violation.labels || [], "konveyor.io/source=");
      const targetTechnologies: string[] = filterLabelsWithPrefix(violation.labels || [], "konveyor.io/target=");
      const dispersedFiles: { [key: string]: DispersedFile } = violation.incidents.reduce<{ [key: string]: DispersedFile }>((acc, incident) => {
        if (!incident.uri || incident.uri === "") {
          return acc
        }
        if (!acc[incident.uri]) {
          const displayName: string = incident.uri.replace(/^.*[\\/]/, '')
          acc[incident.uri] = {
            displayName,
            name: incident.uri,
            ranges: [],
            incidents: [],
            totalIncidents: 0,
            codeSnips: [],
            incidentsUnorganized: [],
          }
        }
        addIncidentToDispersedFile(acc[incident.uri], incident)
        return acc
      }, {})

      const issueProcessed: IssueProcessed = {
        ...violation,
        name,
        appID,
        ruleID,
        totalEffort,
        dispersedFiles,
        totalIncidents,
        sourceTechnologies,
        targetTechnologies,
        id: appID + rs.name + ruleID,
        category: violation.category as IssueCatType,
        effort: violation.effort ? violation.effort : 0,
      }
      return issueProcessed;
    })
  }) || [] as IssueProcessed[];
}

// transforms issues from hub report into IssueProcessed[]
const issuesFromIssuesDto = (appID: string, issues: IssueDto[]): IssueProcessed[] => {
  return issues?.flatMap((issue) => {
    const totalIncidents: number = issue.incidents?.length;
    const totalEffort: number = (issue.effort ? issue.effort : 0) * totalIncidents;
    const name: string = issue.description?.split("\n")[0];
    const sourceTechnologies: string[] = filterLabelsWithPrefix(issue.labels, "konveyor.io/source=");
    const targetTechnologies: string[] = filterLabelsWithPrefix(issue.labels, "konveyor.io/target=");
    const dispersedFiles: { [key: string]: DispersedFile } = issue.incidents.reduce<{ [key: string]: DispersedFile }>((acc, incident) => {
      if (!incident.file || incident.file === "") {
        return acc
      }
      if (!acc[incident.file]) {
        const displayName: string = incident.file.replace(/^.*[\\/]/, '')
        acc[incident.file] = {
          displayName,
          name: incident.file,
          ranges: [],
          incidents: [],
          totalIncidents: 0,
          codeSnips: [],
          incidentsUnorganized: [],
        }
      }
      addIncidentToDispersedFile(acc[incident.file], incident)
      return acc
    }, {})

    const issueProcessed: IssueProcessed = {
      ...issue,
      name,
      appID,
      totalEffort,
      totalIncidents,
      dispersedFiles,
      sourceTechnologies,
      targetTechnologies,
      ruleID: issue.rule || "",
      id: appID + (issue.ruleset || "") + (issue.rule || ""),
      category: issue.category as IssueCatType,
      effort: issue.effort ? issue.effort : 0,
    }
    return issueProcessed
  }) || [] as IssueProcessed[];
}

// transforms dependencies from hub or analyzer output into DependencyProcessed[]
const dependenciesFromDependencyDto = (deps: DependencyDto[]): DependencyProcessed[] => {
  return deps.flatMap((d) => {
    const source: string = d.labels?.find((l) => l.startsWith("konveyor.io/dep-source="))?.replace("konveyor.io/dep-source=", "") || "";
    const language: string = d.labels?.find((l) => l.startsWith("konveyor.io/language="))?.replace("konveyor.io/language=", "") || "";
    const labels: string[] = d.labels?.map((l) => l.includes("=") ? l.split("=")[1] || "" : l) || [];
    const sha: string = d.resolvedIdentifier ? d.resolvedIdentifier : (d.sha ? d.sha : "");
    return {
      ...d,
      sha,
      source,
      language,
      labels,
    } as DependencyProcessed;
  }) || [] as DependencyProcessed[];
}

// transforms tags from analyzer into TagDto[]
const tagsFromRulesetsDto = (rulesets: RulesetDto[]): TagDto[] => {
  return (rulesets || []).flatMap((rs) =>
    (rs.tags || []).flatMap((tagStr) => {
      if (tagStr.includes("=")) {
        const [category, values] = tagStr.split('=');
        return !values ?
          [] : values.split(',').map(value => ({name: value, category: { name: category }}))
      } else {
        return (tagStr && tagStr !== "") ? [{ name: tagStr, category: { name: "Uncategorized" }}] : []
      }
    })
  );
}

export const useAllApplications = () => {
  const transformApplications = useCallback(
    (data: ReportDto[]): ApplicationProcessed[] =>
      data.map((a) => {
        const issues: IssueProcessed[] = a.rulesets ? 
          issuesFromRulesetsDto(a.id, a.files, a.rulesets) : 
          (a.issues ? issuesFromIssuesDto(a.id, a.issues) : [] as IssueProcessed[]);

        const tags: TagDto[] = a.rulesets ?
          tagsFromRulesetsDto(a.rulesets) :
            (a.tags || [] as TagDto[]);

        const tagsFlat: string[] = Array.from(
          new Set(tags.flatMap((t) => t.name))).sort((a, b) => a.localeCompare(b)) || [];

        const depsDto: DependencyDto[] = a.depItems ? 
          a.depItems.flatMap((item) => {
            return item.dependencies.flatMap((d) => {
              return {
                ...d,
                provider: d.provider,
              } as DependencyDto;
            })
          }) : 
          (a.dependencies ? a.dependencies : [] as DependencyDto[]);
        const dependencies: DependencyProcessed[] = dependenciesFromDependencyDto(depsDto);
        
        const appProcessed: ApplicationProcessed = {
          ...a,
          id: String(a.id),
          issues,
          tags,
          tagsFlat,
          dependencies,
        }
        return appProcessed;
  }), []);

  return useMockableQuery<ReportDto[], AxiosError, ApplicationProcessed[]>(
    {
      queryKey: ["apps"],
      select: transformApplications,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      cacheTime: Infinity, 
      staleTime: Infinity,
    },
    MOCK_APPS,
    (window as any)["apps"],
  );
}

export const useDispersedFiles = (issue: IssueProcessed) => {
  return useQuery<DispersedFile[], AxiosError, DispersedFile[]>({
    queryKey: ["dispersedFiles", issue.id],
    queryFn: async () => {
      return new Promise((resolve, reject) => {
          const files: DispersedFile[] = 
            Object.values(issue.dispersedFiles).flatMap(df => organizeDispersedFile(df));
          resolve(files);
      });
    }
  });
}

export const useCodeSnip = (df: DispersedFile, idx: number) => {
  return useQuery<string, AxiosError, string>({
    enabled: df ? true : false,
    queryKey: ["dispersedFiles", df.name, idx],
    queryFn: async () => {
      return new Promise((resolve, reject) => resolve(getCodeSnip(df, idx)))
    },
  });
}