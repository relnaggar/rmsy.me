import React, { useState, useEffect, useCallback } from 'react';

import useApiCall, { OnSuccessParams } from './useApiCall';


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
  includeAuthorisationToken?: boolean,
  responseType?: "json" | "blob",
  cancelable?: boolean,
};

const useFetch = <Data extends unknown>(
  apiPath: string,  
  options?: UseFetchOptions<Data>,
  extraFetchOptions?: RequestInit,
): UseFetch<Data> => {
  const {
    initialData = {} as Data,
    initialFetch = true,
    onSuccess,
    onFail,
    includeAuthorisationToken = true,
    responseType = "json",
    cancelable = true,
  } = options || {};

  const [responseData, setResponseData] = useState<Data>(initialData);
  const [doingInitialFetch, setDoingInitialFetch] = useState<boolean>(initialFetch);

  const handleSuccess = useCallback(async ({ response }: OnSuccessParams): Promise<void> => {
    let theResponseData: Data;
    if (responseType === "json") {
      theResponseData = await response.json();
    } else {
      theResponseData = (await response.blob()) as Data;
    }
    setResponseData(theResponseData);
    onSuccess?.(theResponseData, setResponseData);
  }, [onSuccess, responseType]);

  const { calling: fetching, call, cancel } = useApiCall("GET", {
    apiPath,
    initialFetch: initialFetch,
    cancelable: cancelable,
    onSuccess: handleSuccess,
    onFail,
    includeAuthorisationToken,
    extraFetchOptions,
    responseType,
  });

  useEffect(() => {
    if (doingInitialFetch) {
      call();
      setDoingInitialFetch(false);
    }
  }, [doingInitialFetch, call]);

  const refetch = useCallback((paramString?: string): void => {
    call({ paramString });
  }, [call]);

  const cancelFetch = useCallback((): void => {
    cancel!();
  }, [cancel]);

  return { responseData, setResponseData, fetching, refetch, cancel: cancelFetch };
};

export default useFetch;