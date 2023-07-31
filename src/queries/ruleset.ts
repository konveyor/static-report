import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

import { ApplicationDto, IncidentDto, RulesetDto, ViolationDto } from "@app/api/output";
import { ApplicationProcessed, FileProcessed, TagProcessed, ViolationProcessed } from "@app/models/api-enriched";

import { fetchYaml, useMockableQueries, useMockableQuery } from "./helpers";
import { MOCK_APPS } from "./mocks/ruleset.mock";


export const useFileQuery = (uri: string, enabled: boolean) => {
  let prefixRegex = /^[\S-]+?:\/\//;
  uri = uri.replace(prefixRegex, "/files")
  return useQuery({
    queryKey: ["files", uri],
    queryFn: async () => (await axios.get(uri)).data,
    enabled: enabled,
  })
}

export const useAllApplications = () => {
  const transformApplications = useCallback(
    (data: ApplicationDto[]): ApplicationProcessed[] =>
      data.map((a) => {
        const issues: ViolationProcessed[] = a?.rulesets?.flatMap((rs) => {
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
        
        const appProcessed: ApplicationProcessed = {
          ...a,
          issues,
          tags,
          tagsFlat,
        }
        return appProcessed;
  }), []);

  // fetch the apps.yaml file at public root
  const fetchAppsMeta = useMockableQuery<ApplicationDto[], AxiosError>(
    {
      queryKey: ["apps"],
      queryFn: async () => fetchYaml<ApplicationDto[]>("apps.yaml"),
    },
    MOCK_APPS,
  );

  // for all apps found in apps.yaml, fetch their outputs
  const fetchRulesetsQueries = fetchAppsMeta.data
    ? fetchAppsMeta.data?.map((a) => {
        return {
            queryKey: ["rulesets", a.id],
            queryFn: async () => fetchYaml<RulesetDto[]>(a.outputPath),
            enabled: !fetchAppsMeta.isError && !fetchAppsMeta.isLoading,
          }
        }) : [];

  const mockData = fetchAppsMeta.data 
    ? fetchAppsMeta.data?.map((a) => {
      return a.rulesets
    }) : [];

  const fetchRulesets = useMockableQueries(fetchRulesetsQueries, mockData)

  const isLoading = fetchAppsMeta.isLoading || fetchRulesets?.some(q => q.isLoading);
  const isError = fetchAppsMeta.isError || fetchRulesets?.some(q => q.isError);
  const isFetching = fetchAppsMeta.isFetching || fetchRulesets?.some(q => q.isFetching);
  const data = fetchAppsMeta.data && fetchRulesets.length > 0 ? 
    fetchAppsMeta.data.map((app, index) => ({
      ...app,
      rulesets: fetchRulesets[index].data || [] as RulesetDto[],
    })) : [] as ApplicationDto[];
  
  const transformedData = transformApplications(data as ApplicationDto[] || [])

  return { data: transformedData, isLoading, isError, isFetching }
}
