import useFetch, { UseFetch } from "./useFetch";


export interface UseFetchResource<Resource extends unknown> extends Omit<UseFetch<Resource[]>, "responseData" | "setResponseData"> {
  resources: Resource[],
  setResources: React.Dispatch<React.SetStateAction<Resource[]>>,
};

const useFetchResource = <Resource extends unknown>(
  apiPath: string,
  options?: {
    onSuccess?: (resources: Resource[], setResources: React.Dispatch<React.SetStateAction<Resource[]>>) => void,
    onFail?: (errors: Record<string,string[]>) => void,
    initialFetch?: boolean,
  }
): UseFetchResource<Resource> => {
  const { responseData: resources, setResponseData: setResources, ...remainingFetch } = useFetch<Resource[]>(apiPath, {
    ...options,
    initialData: [],
  });
  return { resources, setResources, ...remainingFetch };
};

export default useFetchResource;