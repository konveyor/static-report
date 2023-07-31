import axios from "axios";
import yaml from "js-yaml";
import { UseQueryOptions, useQuery, useQueries } from "@tanstack/react-query";

const defaultTimeout =
  process.env.REACT_APP_DATA_SOURCE_TIMEOUT !== undefined
    ? Number(process.env.REACT_APP_DATA_SOURCE_TIMEOUT)
    : 1000;

const mockPromise = <TQueryFnData>(
  data: TQueryFnData,
  timeout = defaultTimeout,
  success = true
) => {
  return new Promise<TQueryFnData>((resolve, reject) => {
    setTimeout(() => {
      if (success) {
        resolve(data);
      } else {
        reject({ message: "Error" });
      }
    }, timeout);
  });
};

export const useMockableQuery = <
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData
>(
  params: UseQueryOptions<TQueryFnData, TError, TData>,
  mockData: TQueryFnData,
) => {
  return useQuery<TQueryFnData, TError, TData>({
    ...params,
    queryFn:
      (process.env.REACT_APP_DATA_SOURCE === "mock")
        ? () => {
          return mockPromise(mockData);
        }
        : params.queryFn,
  });
};

export const useMockableQueries = (
  params: UseQueryOptions[],
  mockData: any[],
) => {
  const queries  = params.map((p, idx) => {
    return {
      ...p,
      queryFn:       
      (process.env.REACT_APP_DATA_SOURCE === "mock")
        ? () => {
          return mockPromise(mockData[idx]);
        }
        : p.queryFn,
    }
  });
  return useQueries({queries});
}

export const fetchYaml = async<T=any> (url:string): Promise<T> => {
  const response = await axios.get<string>(url)
  return yaml.load(response.data) as T
}
