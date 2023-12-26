import { useContext, useState, useRef, useCallback } from "react";

import useApiRoot from "./useApiRoot";
import { FetchDataContext } from "../routes/routesConfig";
import { CSRFTokenContext } from "../routes/Layout";


export interface OnSuccessParams {
  response: Response,
  resourceId?: number,
};

export interface AfterCallParams {
  resourceId?: number,
};

interface CallParams {
  data?: any,
  resourceId?: number,
  paramString?: string,
  apiPath?: string,
};

export interface UseApiCall {
  calling: boolean,
  call: (params?: CallParams) => Promise<void>,
  cancel?: () => void,
};

const makeErrorMessage = (error: any): string[] => {
  if (error instanceof Error) {
    if (error.message === "Failed to fetch") {
      return ["Failed to connect to server. Please check your internet connection and try again."];
    } else {
      return [error.message];
    }
  } else {
    return [String(error)];
  }
};

const useApiCall = (  
  method: "GET" | "POST" | "PATCH" | "DELETE",  
  options?: {
    apiPath?: string,
    initialFetch?: boolean,
    cancelable?: boolean,
    beforeCall?: (postData: any) => void,
    onSuccess?: (params: OnSuccessParams) => Promise<void>,
    afterCall?: (params : AfterCallParams) => void,
    onFail?: (errors: Record<string,string[]>) => void,
    extraFetchOptions?: RequestInit,
  },
): UseApiCall => {
  const { apiPath, beforeCall, onSuccess, afterCall, onFail, cancelable = false, initialFetch = false } = options || {};

  const csrfToken: string = useContext(CSRFTokenContext)
  const includeCsrfToken: boolean = method === "POST" || method === "PATCH" || method === "DELETE";

  const apiRoot: string = useApiRoot();
  const fetchData = useContext(FetchDataContext);
  const [calling, setCalling] = useState<boolean>(initialFetch);
  const abortControllerRef = useRef<AbortController>(new AbortController());

  const call = useCallback(async (params?: CallParams): Promise<void> => {
    const { data, resourceId, paramString, apiPath: apiPathOverride, ...extraFetchOptions } = params || {};

    if (cancelable) {
      if (calling) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();
    }
    setCalling(true);

    beforeCall?.(data);

    let body: FormData | string | undefined;
    if (data === undefined) {
      body = undefined;
    } else {
      const formData = new FormData();
      let containsFile = false;
      for (const [key, value] of Object.entries(data as Record<string, string | Blob>)) {
        if (value instanceof File) {
          containsFile = true;          
        }
        formData.append(key, value as string | Blob);
      }
      body = containsFile ? formData : JSON.stringify(data);
    }

    let errors: Record<string,string[]> = {};
    try {
      let headers: Record<string,string> = body instanceof FormData ? {} : {
        "Content-Type": "application/json",
      };
      if (includeCsrfToken) {
        headers["X-CSRFToken"] = csrfToken;
      }

      let url: string = apiRoot
      if (apiPathOverride !== undefined) {
        url += apiPathOverride;
      } else if (apiPath !== undefined) {
        url += apiPath;
      } else {
        throw new Error("apiPath must be provided");
      }
      if (resourceId !== undefined) {
        url += `${resourceId}/`;
      }
      if (paramString !== undefined) {
        url += `?${paramString}`;
      }

      const response: Response = await fetchData(url, {
        method: method,
        headers: headers,
        body: body,
        signal: cancelable ? abortControllerRef.current.signal : undefined,
        ...extraFetchOptions,
      });

      // wait for 3 seconds before continuing
      // await new Promise(resolve => setTimeout(resolve, 3000));

      if (response.ok) {
        await onSuccess?.({response, resourceId});
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
      if (!cancelable || !abortControllerRef.current.signal.aborted) {
        afterCall?.({resourceId});
        setCalling(false);
        if (Object.keys(errors).length > 0) {
          onFail?.(errors);
        }
      }
    }
  }, [fetchData, apiRoot, apiPath, method, csrfToken, includeCsrfToken, calling, beforeCall, onSuccess, afterCall, onFail, cancelable]);

  let cancel = undefined;
  if (cancelable) {
    cancel = (): void => {
      abortControllerRef.current.abort();
      setCalling(false);
    }
  }

  return { calling, call, cancel };
};

export default useApiCall;