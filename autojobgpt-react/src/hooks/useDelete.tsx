import React, { useContext, useEffect, useState } from "react";

import useAPI from "./useAPI";
import { FetchDataContext } from "../routes/routesConfig";
import { CSRFTokenContext } from "../routes/Layout";
import { WithID } from "../common/types";
import { makeErrorMessage } from "./hooksUtils";


export default function useDelete<Resource extends WithID>(
  apiPath: string,
  resources: Resource[],
  setResources: React.Dispatch<React.SetStateAction<Resource[]>>,
  options?: {
    onSuccess?: () => void,
    onFail?: (errors: Record<string,string>) => void,
  },
): {
  deleteResource: (id: number) => void,
  idBeingDeleted: number,
} {
  const { onSuccess, onFail } = options || {};

  const apiRoute: string = useAPI();
  const fetchData = useContext(FetchDataContext);
  const csrfToken = useContext(CSRFTokenContext);

  const [idBeingDeleted, setIDBeingDeleted] = useState<number>(-1);

  useEffect(() => {
    async function doDelete(): Promise<void> {
      let errors: Record<string,string> = {};
      try {
        const response: Response = await fetchData(`${apiRoute}${apiPath}${idBeingDeleted}/`, { 
          method: "DELETE", 
          headers: { "X-CSRFToken": csrfToken, "Content-Type": "application/json" },
        })
        if (response.ok) {
          setResources(resources.filter((resource) => resource.id !== idBeingDeleted));
          onSuccess?.();
        } else {
          errors = await response.json();
        }
      } catch (error) {
        errors["error"] = makeErrorMessage(error);
      } finally {
        setIDBeingDeleted(-1);
        if (Object.keys(errors).length > 0) {
          onFail?.(errors);
        }
      }
    }
    if (idBeingDeleted !== -1) {
      doDelete();
    }
  }, [fetchData, apiRoute, apiPath, csrfToken, idBeingDeleted, resources, onSuccess, onFail, setResources]);

  function deleteResource(id: number): void {
    setIDBeingDeleted(id);
  }
  
  return { deleteResource, idBeingDeleted };
}