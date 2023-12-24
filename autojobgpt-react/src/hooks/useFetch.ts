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
};

const useFetch = <Data extends unknown>(
  apiPath: string,  
  options?: UseFetchOptions<Data>,
): UseFetch<Data> => {
  const { initialData = {} as Data, initialFetch = true, onSuccess, onFail } = options || {};

  const [responseData, setResponseData] = useState<Data>(initialData);
  const [doingInitialFetch, setDoingInitialFetch] = useState<boolean>(initialFetch);

  const handleSuccess = useCallback(async ({ response }: OnSuccessParams): Promise<void> => {
    const responseData: Data = await response.json();
    setResponseData(responseData);
    onSuccess?.(responseData, setResponseData);
  }, [onSuccess]);

  const { calling: fetching, call, cancel } = useApiCall("GET", {
    apiPath,
    cancelable: true,
    onSuccess: handleSuccess,
    onFail
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