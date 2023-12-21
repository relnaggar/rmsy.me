import { useContext, useState, useRef } from "react";

import useApiRoot from "./useApiRoot";
import { FetchDataContext } from "../routes/routesConfig";
import { CSRFTokenContext } from "../routes/Layout";
import { makeErrorMessage } from "./hooksUtils";


export interface UseApiCall {
  calling: boolean,
  call: (postData: any) => Promise<void>,  
  cancel: () => void,
};

const useApiCall = <Resource extends unknown = never>(
  apiPath: string,
  method: "GET" | "POST" | "PATCH" | "DELETE",
  options?: {
    beforeCall?: (postData: any) => Resource[],
    onSuccess?: ((response: Response) => Promise<void>) | ((response: Response, newResources: Resource[]) => Promise<void>),
    afterCall?: (newResources: Resource[]) => void,
    onFail?: (errors: Record<string,string[]>) => void,
  },
): UseApiCall => {
  const { beforeCall, onSuccess, afterCall, onFail } = options || {};

  const csrfToken: string = useContext(CSRFTokenContext)
  const includeCsrfToken: boolean = method === "POST" || method === "PATCH" || method === "DELETE";

  const apiRoot: string = useApiRoot();
  const fetchData = useContext(FetchDataContext);
  const [calling, setCalling] = useState<boolean>(false);
  const abortControllerRef = useRef<AbortController>(new AbortController());

  const call = async (postData: any): Promise<void> => {
    if (calling) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    setCalling(true);

    let newResources = beforeCall?.(postData);

    let body: FormData | string | undefined;
    if (postData === undefined) {
      body = undefined;
    } else {
      const formData = new FormData();
      let containsFile = false;
      for (const [key, value] of Object.entries(postData as Record<string, string | Blob>)) {
        if (value instanceof File) {
          containsFile = true;          
        }
        formData.append(key, value as string | Blob);
      }
      body = containsFile ? formData : JSON.stringify(postData);
    }

    let errors: Record<string,string[]> = {};
    try {
      let headers: Record<string,string> = body instanceof FormData ? {} : {
        "Content-Type": "application/json",
      };
      if (includeCsrfToken) {
        headers["X-CSRFToken"] = csrfToken;
      }

      const response: Response = await fetchData(`${apiRoot}${apiPath}`, {
        method: method,
        headers: headers,
        body: body,
        signal: abortControllerRef.current.signal,
      });

      // wait for 3 seconds before continuing
      // await new Promise(resolve => setTimeout(resolve, 3000));

      if (response.ok) {
        if (newResources !== undefined) {
          const onSuccessWithResource = onSuccess as ((response: Response, newResources: Resource[]) => Promise<void>);
          await onSuccessWithResource(response, newResources);
        } else if (onSuccess !== undefined) {
          const onSuccessWithoutResource = onSuccess as ((response: Response) => Promise<void>);
          await onSuccessWithoutResource(response);
        }
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
        afterCall?.(newResources!);
        setCalling(false);
        if (Object.keys(errors).length > 0) {
          onFail?.(errors);
        }
      }
    }
  };

  const cancel = (): void => {
    abortControllerRef.current.abort();
    setCalling(false);
  };

  return { calling, call, cancel };
};

export default useApiCall;