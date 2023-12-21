import React, { useContext, useState, useEffect, useRef } from 'react';

import useAPI from "./useApiRoot";
import { FetchDataContext } from "../routes/routesConfig";
import { makeErrorMessage } from "./hooksUtils";


export interface UseFetch<ResponseData> {
  responseData: ResponseData,
  setResponseData: React.Dispatch<React.SetStateAction<ResponseData>>,
  fetching: boolean,
  refetch: (paramString?: string) => void,
  cancel: () => void,
};

interface UseFetchOptions<ResponseData> {
  onSuccess?: (responseData: ResponseData, setResponseData: React.Dispatch<React.SetStateAction<ResponseData>>) => void,
  onFail?: (errors: Record<string,string[]>) => void,  
  initialFetch?: boolean,
  initialData?: ResponseData,
};

const useFetch = <Data extends unknown>(
  apiPath: string,  
  options?: UseFetchOptions<Data>,
): UseFetch<Data> => {
  const {
    initialData = {} as Data,
    initialFetch = true,
    onSuccess,
    onFail,
  } = options || {};

  const apiRoute: string = useAPI();
  const fetchData = useContext(FetchDataContext);

  const [responseData, setResponseData] = useState<Data>(initialData);
  const [fetching, setFetching] = useState<boolean>(initialFetch);
  const [paramString, setParamString] = useState<string>("");

  const abortControllerRef = useRef<AbortController>(new AbortController());

  useEffect(() => {
    const doFetch = async (): Promise<void> => {
      let errors: Record<string,string[]> = {};
      try {
        const response: Response = await fetchData(`${apiRoute}${apiPath}${paramString}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          signal: abortControllerRef.current.signal,
        });

        // wait for 3 seconds before continuing
        // await new Promise(resolve => setTimeout(resolve, 3000));

        if (response.ok) {
          const responseData: Data = await response.json();
          setResponseData(responseData);
          onSuccess?.(responseData, setResponseData);
        } else {
          errors = await response.json();
          if (!String(errors)) {
            errors = {error: makeErrorMessage(response.statusText)};
          }
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
    };

    if (fetching) {
      abortControllerRef.current = new AbortController();
      doFetch();
    }    
  }, [fetchData, apiRoute, apiPath, paramString, fetching, onSuccess, onFail]);

  const refetch = (paramString?: string): void => {
    if (fetching) {
      abortControllerRef.current.abort();
    }
    if (paramString) {
      setParamString(`?${paramString}`);
    }
    setFetching(true);
  };

  const cancel = (): void => {
    abortControllerRef.current.abort();
    setFetching(false);
  };

  return { responseData, setResponseData, fetching, refetch, cancel };
};

export default useFetch;