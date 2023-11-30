import React, { useContext, useState, useEffect, useRef } from 'react';

import useAPI from "./useAPI";
import { FetchDataContext } from "../routes/routesConfig";
import { makeErrorMessage } from "./hooksUtils";


export default function useFetch<Resource>(
  apiPath: string,  
  options?: {
    initialResource?: Resource,
    initialFetch?: boolean,
    onSuccess?: (resource: Resource) => void,
    onFail?: (errors: Record<string,string>) => void,    
  },
): {
  resource: Resource,
  setResource: React.Dispatch<React.SetStateAction<Resource>>,
  fetching: boolean,
  refetch: (paramString?: string) => void,
  cancel: () => void,
} {
  const {
    initialResource = {} as Resource,
    initialFetch = true,
    onSuccess,
    onFail,
  } = options || {};

  const apiRoute: string = useAPI();
  const fetchData = useContext(FetchDataContext);

  const [resource, setResource] = useState<Resource>(initialResource);
  const [fetching, setFetching] = useState<boolean>(initialFetch);
  const [paramString, setParamString] = useState<string>("");

  const abortControllerRef = useRef<AbortController>(new AbortController());

  useEffect(() => {
    async function doFetch(): Promise<void> {
      let errors: Record<string,string> = {};
      try {
        const response: Response = await fetchData(`${apiRoute}${apiPath}${paramString}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          signal: abortControllerRef.current.signal,
        });

        if (response.ok) {
          const resource: Resource = await response.json();
          setResource(resource);
          onSuccess?.(resource);
        } else {
          errors = await response.json();
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          // do nothing
        } else {
          errors["error"] = makeErrorMessage(error);
        }
      } finally {     
        if (!abortControllerRef.current.signal.aborted) {
          setFetching(false);
          if (Object.keys(errors).length > 0) {
            onFail?.(errors);
          }
        }
      }
    }

    if (fetching) {
      abortControllerRef.current = new AbortController();
      doFetch();
    }    
  }, [fetchData, apiRoute, apiPath, paramString, fetching, onSuccess, onFail]);

  function refetch(paramString?: string): void {
    if (fetching) {
      abortControllerRef.current.abort();
    }
    if (paramString) {
      setParamString(`?${paramString}`);
    }
    setFetching(true);
  }

  function cancel(): void {
    abortControllerRef.current.abort();
    setFetching(false);
  }

  return { resource, setResource, fetching, refetch, cancel };
}