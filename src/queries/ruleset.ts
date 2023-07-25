import { useCallback } from "react";

import axios, { AxiosError } from "axios";

import { AppDto, IncidentDto, ViolationDto } from "@app/api/ruleset";
import { ApplicationProcessed, TagProcessed, ViolationProcessed } from "@app/models/api-enriched";

import { useMockableQuery } from "./helpers";
import { MOCK_APPS } from "./mocks/ruleset.mock";
import { useQuery } from "@tanstack/react-query";

export const useApplicationsQuery = () => {
  const transformCallback = useCallback(
    (data: AppDto[]): ApplicationProcessed[] =>
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
            const files = violation.incidents.reduce<{ [key: string]: IncidentDto[] }>((acc, incident) => {
              acc[incident.uri] = acc[incident.uri] ? [...acc[incident.uri], incident] : [incident];
              return acc
            }, {});

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

        const appProcessed: ApplicationProcessed = {
          ...a,
          issues,
          tags,
        }

        return appProcessed;
      }),
    []
  );

  return useMockableQuery<AppDto[], AxiosError, ApplicationProcessed[]>(
    {
      queryKey: ["apps"],
      queryFn: async() => 
      (await axios.get<AppDto[]>("apps")).data,
      select: transformCallback,
    },
    MOCK_APPS,
    (window as any)["apps"],
  );
}

export const useFileQuery = (uri: string) => {
  let prefixRegex = /^[\S-]+?:\/\//;
  if (process.env.REACT_APP_DATA_SOURCE==="mock") {
      uri = uri.replace(prefixRegex, "./files/")
  } else {
    uri = uri.replace(prefixRegex, "./files/")
  }
  return useQuery(["files"], async () => {
    const response = await fetch(uri)
    if (!response.ok) {
      throw new Error("failed getting file")
    }
    return await response.text()
  })
}
