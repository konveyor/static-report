import { useCallback } from "react";
import { AxiosError } from "axios";

import { ApplicationDto, IncidentDto, ViolationDto } from "@app/api/report";
import { ApplicationProcessed, DependencyProcessed, FileProcessed, TagProcessed, IssueProcessed } from "@app/models/api-enriched";

import { useMockableQuery } from "./helpers";
import { MOCK_APPS } from "./mocks/report.mock";


export const useFileQuery = (uri: string, appId: string, enabled: boolean) => {
  const getFile = useCallback((apps: ApplicationDto[]): string => 
    apps.find((a) => a.id === appId)?.files[uri] || ""
   , [uri, appId]);

  return useMockableQuery<ApplicationDto[], AxiosError, string>(
    {
      queryKey: ["apps", uri],
      select: getFile,
      enabled,
    },
    MOCK_APPS,
    (window as any)["apps"],
  );
}

export const useAllApplications = () => {
  const transformApplications = useCallback(
    (data: ApplicationDto[]): ApplicationProcessed[] =>
      data.map((a) => {
        const issues: IssueProcessed[] = a?.rulesets?.flatMap((rs) => {
          const allViolations = rs.violations || {}
          return Object.keys(allViolations).map((ruleID) => {
            const violation: ViolationDto = rs.violations[ruleID];

            const totalIncidents: number = violation.incidents.length
            
            const totalEffort: number = violation.effort * totalIncidents;
            
            const name: string = violation.description?.split("\n")[0] 
            
            const sourceTechnologies: string[] = violation.labels
              .filter(s => s.startsWith("konveyor.io/source="))
              .map(s => s.slice(s.indexOf("=")+1))
            
            const targetTechnologies: string[] = violation.labels
              .filter(s => s.startsWith("konveyor.io/target="))
              .map(s => s.slice(s.indexOf("=") + 1))
            
            const allFiles = violation.incidents.reduce<{ [key: string]: IncidentDto[] }>((acc, incident) => {
              acc[incident.uri] = acc[incident.uri] ? [...acc[incident.uri], incident] : [incident];
              return acc
            }, {});
            
            const files: FileProcessed[] = Object.entries(allFiles).reduce<FileProcessed[]>((acc, [name, incidents]) => {
              const isLocal: boolean = name.startsWith("file://")
              const displayName: string = name.replace(/^.*[\\/]/, '')
              if (isLocal) {
                acc = [...acc, { displayName, name, isLocal, incidents } ]
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
                    isLocal,
                    codeSnip: i.codeSnip,
                    incidents: [i],
                  }
                })
                acc = [...acc, ...depIncidents]
              }
              return acc
            }, [] as FileProcessed[])
            
            const violationProcessed: IssueProcessed = {
              ...violation,
              id: a.id + rs.name + ruleID,
              rule: "",
              appID: a.id,
              ruleID: ruleID,
              totalEffort,
              totalIncidents,
              name,
              sourceTechnologies,
              targetTechnologies,
              files,
            }
            
            return violationProcessed;
          })
        })

        const tags: TagProcessed[] = (a.rulesets || []).flatMap((rs) =>
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

        const tagsFlat: string[] = Array.from(new Set(tags.flatMap((t) => t.tag))).sort((a, b) => a.localeCompare(b)) || [];

        const dependencies: DependencyProcessed[] = a.depItems?.flatMap((item) => {
          const deps: DependencyProcessed[] = item.dependencies?.flatMap((d) => {
            const source: string = d.labels?.find((l) => l.startsWith("konveyor.io/dep-source="))?.replace("konveyor.io/dep-source=", "") || "";
            const language: string = d.labels?.find((l) => l.startsWith("konveyor.io/language="))?.replace("konveyor.io/language=", "") || "";
            const labels: string[] = d.labels?.map((l) => l.includes("=") ? l.split("=")[1] || "" : l) || [];
            return {
              ...d,
              fileURI: item.fileURI,
              provider: item.provider,
              source,
              language,
              labels,
            } as DependencyProcessed;
          }) || [] as DependencyProcessed[];
          return deps;
        }) || [] as DependencyProcessed[];
        
        const appProcessed: ApplicationProcessed = {
          ...a,
          issues,
          tags,
          tagsFlat,
          dependencies,
        }
        return appProcessed;
  }), []);

  return useMockableQuery<ApplicationDto[], AxiosError, ApplicationProcessed[]>(
    {
      queryKey: ["apps"],
      select: transformApplications,
    },
    MOCK_APPS,
    (window as any)["apps"],
  );
}
