import { useCallback } from "react";
import { AxiosError } from "axios";

import {
  ReportDto,
  IncidentDto,
  IssueDto,
  RulesetDto,
  FileDto,
  DependencyDto,
  TagDto
} from "@app/api/report";
import { 
  ApplicationProcessed,
  DependencyProcessed,
  FileProcessed,
  IssueProcessed,
  IssueCatType
} from "@app/models/api-enriched";
import { useMockableQuery } from "./helpers";
import { MOCK_APPS } from "./mocks/report.mock";
import { DispersedFile, addIncidentToDispersedFile } from "@app/models/file";


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
      const sourceTechnologies: string[] = filterLabelsWithPrefix(violation.labels, "konveyor.io/source=");
      const targetTechnologies: string[] = filterLabelsWithPrefix(violation.labels, "konveyor.io/target=");
      const allFiles = violation.incidents.reduce<{ [key: string]: IncidentDto[] }>((acc, incident) => {
        if (!incident.uri || incident.uri === "") {
          return acc
        }
        acc[incident.uri] = acc[incident.uri] ? [...acc[incident.uri], incident] : [incident];
        return acc
      }, {});
      const files: FileProcessed[] = Object.entries(allFiles).reduce<FileProcessed[]>((acc, [name, incidents]) => {
        const isFound: boolean = filesRaw ? ( filesRaw[name] ? true : false) : false;
        const displayName: string = name.replace(/^.*[\\/]/, '')
        if (isFound) {
          acc = [...acc, { displayName, name, isFound, incidents } ]
        } else {
          const packageNameRegex = /packageName=(.*)?&/;
          const match = displayName.match(packageNameRegex);
          let packageName = "";
          if (match && match[1]) {
            packageName = match[1]
          }
          const depIncidents: FileProcessed[] = incidents.flatMap((i) => {
            return {
              displayName: packageName || displayName,
              name,
              isFound,
              codeSnip: i.codeSnip,
              incidents: [i],
            }
          })
          acc = [...acc, ...depIncidents]
        }
        return acc
      }, [] as FileProcessed[]);
      const dispersedFiles: { [key: string]: DispersedFile } = violation.incidents.reduce<{ [key: string]: DispersedFile }>((acc, incident) => {
        if (!incident.uri || incident.uri === "") {
          return acc
        }
        if (!acc[incident.uri]) {
          const displayName: string = incident.uri.replace(/^.*[\\/]/, '')
          acc[incident.uri] = {
            displayName,
            content: [],
            incidents: [],
            name: incident.uri,
            ranges: [],
            totalSnips: 0,
            totalIncidents: 0,
          }
        }
        addIncidentToDispersedFile(acc[incident.uri], incident)
        return acc
      }, {})
      console.log(dispersedFiles)
      const issueProcessed: IssueProcessed = {
        ...violation,
        name,
        appID,
        files,
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
    const files: FileProcessed[] = issue.incidents?.flatMap((inc) => {
      if (!inc.file || inc.file === "") {
        return [] as FileProcessed[];
      }
      const displayName: string = inc.file?.replace(/^.*[\\/]/, '')
      return {
        displayName,
        name: inc.file,
        isFound: false,
        incidents: [inc],
        codeSnip: inc.codeSnip,
      } as FileProcessed;
    }) || [] as FileProcessed[];
    const dispersedFiles: { [key: string]: DispersedFile } = issue.incidents.reduce<{ [key: string]: DispersedFile }>((acc, incident) => {
      if (!incident.file || incident.file === "") {
        return acc
      }
      if (!acc[incident.file]) {
        const displayName: string = incident.file.replace(/^.*[\\/]/, '')
        acc[incident.file] = {
          content: [],
          incidents: [],
          name: incident.file,
          ranges: [],
          totalSnips: 0,
          displayName,
          totalIncidents: 0,
        }
      }
      addIncidentToDispersedFile(acc[incident.file], incident)
      return acc
    }, {})
    const issueProcessed: IssueProcessed = {
      ...issue,
      name,
      appID,
      files,
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
          [] : values.split(',').map(value => ({tag: value, category}))
      } else {
        return (tagStr && tagStr !== "") ? [{ tag: tagStr, category: "Uncategorized"}] : []
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
          new Set(tags.flatMap((t) => t.tag))).sort((a, b) => a.localeCompare(b)) || [];

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
    },
    MOCK_APPS,
    (window as any)["apps"],
  );
}
