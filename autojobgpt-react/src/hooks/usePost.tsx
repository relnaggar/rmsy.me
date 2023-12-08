import { useContext, useState, useEffect, useRef } from "react";

import useAPI from "./useAPI";
import { FetchDataContext } from "../routes/routesConfig";
import { CSRFTokenContext } from "../routes/Layout";
import { makeErrorMessage } from "./hooksUtils";


export default function usePost<Resource>(
  apiPath: string,
  options?: {
    onSuccess?: (resource: Resource) => void,
    onFail?: (errors: Record<string,string[]>) => void,
  },
): {
  posting: boolean,
  post: (postData?: any) => void,
  cancel: () => void,
} {
  const { onSuccess, onFail } = options || {};

  const apiRoute: string = useAPI();
  const fetchData = useContext(FetchDataContext);
  const csrfToken = useContext(CSRFTokenContext);

  const [posting, setPosting] = useState<boolean>(false);
  const [postData, setPostData] = useState<any>(null);

  const abortControllerRef = useRef<AbortController>(new AbortController());

  useEffect(() => {
    async function doPost(): Promise<void> {      
      let errors: Record<string,string[]> = {};
      try {
        const response: Response = await fetchData(`${apiRoute}${apiPath}`, {
          method: "POST",
          headers: { "X-CSRFToken": csrfToken, "Content-Type": "application/json" },
          body: postData? JSON.stringify(postData) : undefined,
          signal: abortControllerRef.current.signal,
        });

        // wait for 3 seconds before continuing
        // await new Promise(resolve => setTimeout(resolve, 3000));

        if (response.ok) {
          const resource: Resource = await response.json();
          onSuccess?.(resource);
        } else {
          errors = await response.json();
        }
      } catch (error) {
        errors["error"] = makeErrorMessage(error);
      } finally {
        if (!abortControllerRef.current.signal.aborted) {
          setPosting(false);
          if (Object.keys(errors).length > 0) {
            onFail?.(errors);
          }
        }
      }
    }
    if (posting) {
      abortControllerRef.current = new AbortController();
      doPost();
    }
  }, [fetchData, apiRoute, apiPath, csrfToken, posting, postData, onSuccess, onFail]);

  function post(postData?: any): void {
    if (posting) {
      abortControllerRef.current.abort();
    }
    setPosting(true);
    setPostData(postData);
  }

  function cancel(): void {
    abortControllerRef.current.abort();
    setPosting(false);
  }

  return { posting, post, cancel };
}