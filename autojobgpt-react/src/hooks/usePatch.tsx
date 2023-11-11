import React, { useContext, useEffect, useState } from "react";

import useAPI from "./useAPI";
import { FetchDataContext } from "../routes/routesConfig";
import { CSRFTokenContext } from "../routes/Layout";
import { WithID } from "../common/types";


export default function usePatch<Resource extends WithID>(
  apiPath: string,
  resources: Resource[],
  setJobs: React.Dispatch<React.SetStateAction<Resource[]>>
): {
  updateResource: (id: number, patch: Partial<Resource>) => void,
  error: string
} {
  const apiRoute: string = useAPI();
  const fetchData = useContext(FetchDataContext);
  const csrfToken = useContext(CSRFTokenContext);

  const [updatedId, setUpdatedId] = useState<number>(-1);
  const [patch, setPatch] = useState<Partial<Resource>>({});
  const [error, setError] = useState<string>("");

  useEffect(() => {
    async function patchResource(): Promise<void> {
      await fetchData(`${apiRoute}${apiPath}${updatedId}/`, { 
        method: "PATCH", 
        headers: { "X-CSRFToken": csrfToken, "Content-Type": "application/json" },
        body: JSON.stringify(patch)
      })
      .catch((error) => setError(error.message))
      .finally(() => {
        setUpdatedId(-1);
      });
    }
    if (updatedId !== -1) {
      patchResource();
    }
  }, [fetchData, apiRoute, apiPath, csrfToken, updatedId, setUpdatedId, patch, setError]);

  function updateResource(id: number, patch: Partial<Resource>): void {
    setJobs(
      resources.map((resource) => {
        if (resource.id === id) {
          return { ...resource, ...patch };
        } else {
          return resource;
        }
      })
    );
    setPatch(patch);
    setUpdatedId(id);
  }

  return { updateResource, error }
}