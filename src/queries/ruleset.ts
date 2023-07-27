import { useCallback } from "react";

import { useQuery } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

import { ApplicationDto, IncidentDto, ViolationDto } from "@app/api/output";
import { ApplicationProcessed, FileProcessed, TagProcessed, ViolationProcessed } from "@app/models/api-enriched";

import { useMockableQuery } from "./helpers";
import { MOCK_APPS } from "./mocks/ruleset.mock";

export const useApplicationsQuery = () => {
  const transformCallback = useCallback(
    (data: ApplicationDto[]): ApplicationProcessed[] =>
      data.map((a) => {
        const issues: ViolationProcessed[] = a.rulesets.flatMap((rs) => {
          return Object.keys(rs.violations).map((ruleID) => {
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
              if (isLocal) {
                acc = [...acc, { name, isLocal, incidents } ]
              } else {
                const depIncidents: FileProcessed[] = incidents.flatMap((i) => {
                  return {
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

            const violationProcessed: ViolationProcessed = {
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

        const tags: TagProcessed[] = a.rulesets.flatMap((rs) => 
          rs.tags.flatMap((tagStr) => {
            const [category, values] = tagStr.split('=');
            return !values ?
              [] : values.split(',').map(value => ({tag: value, category}))
          })
        )

        const tagsFlat: string[] = Array.from(new Set(tags.flatMap((t) => t.tag))).sort((a, b) => a.localeCompare(b))

        const appProcessed: ApplicationProcessed = {
          ...a,
          issues,
          tags,
          tagsFlat,
        }

        return appProcessed;
      }),
    []
  );

  return useMockableQuery<ApplicationDto[], AxiosError, ApplicationProcessed[]>(
    {
      queryKey: ["apps"],
      queryFn: async() => 
      (await axios.get<ApplicationDto[]>("apps")).data,
      select: transformCallback,
    },
    MOCK_APPS,
    (window as any)["apps"],
  );
}

export const useFileQuery = (uri: string) => {
  let prefixRegex = /^[\S-]+?:\/\//;
  uri = uri.replace(prefixRegex, "/files/")
  // return useQuery(["files", uri], async () => (await axios.get(uri)).data)
  return useQuery(["files", uri], async () => {
    const response = await fetch(uri)
    if (!response.ok) {
      throw new Error("failed getting file")
    }
    const data = await response.text()
    return data
  })
}
