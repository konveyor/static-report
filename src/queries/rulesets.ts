import { useCallback } from "react";

import { UseQueryResult } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

import { RulesetDto } from "@app/api/ruleset";

import { useMockableQuery } from "./helpers";
import { MOCK_RULESETS } from "./mocks/rulesets.mock";

export const useRulesetQuery = (): UseQueryResult<
  RulesetDto[],
  AxiosError
> => {
  return useMockableQuery<RulesetDto[], AxiosError>(
    {
      queryKey: ["rulesets"],
      queryFn: async() => 
      (await axios.get<RulesetDto[]>("rulesets")).data,
    },
    MOCK_RULESETS,
      (window as any)["rulesets"],
  );
}
