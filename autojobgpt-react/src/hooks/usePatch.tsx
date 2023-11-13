import React, { useContext, useEffect, useState } from "react";

import useAPI from "./useAPI";
import { FetchDataContext } from "../routes/routesConfig";
import { CSRFTokenContext } from "../routes/Layout";
import { WithID } from "../common/types";


export default function usePatch<Resource extends WithID>(
  apiPath: string,
  resources: Resource[],
  setResources: React.Dispatch<React.SetStateAction<Resource[]>>
): {
  updateResource: (id: number, patch: Partial<Resource>) => void,
  updated: boolean,
  error: string
} {
  const apiRoute: string = useAPI();
  const fetchData = useContext(FetchDataContext);
  const csrfToken = useContext(CSRFTokenContext);

  const [updatedID, setUpdatedID] = useState<number>(-1);
  const [patch, setPatch] = useState<Partial<Resource>>({});
  const [error, setError] = useState<string>("");

  useEffect(() => {
    async function patchResource(): Promise<void> {
      await fetchData(`${apiRoute}${apiPath}${updatedID}/`, { 
        method: "PATCH", 
        headers: { "X-CSRFToken": csrfToken, "Content-Type": "application/json" },
        body: JSON.stringify(patch)
      })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          setError(`${data.error}: ${data.details}`);  
          console.error(`${data.error}: ${data.details}`);
        } else {
          setResources(resources.map((resource) => resource.id === updatedID ? data : resource))
          setError("");
        }
      })
      .catch(error => {
        setError(error.message);
        console.error(error.message);
      })
      .finally(() => setUpdatedID(-1));
    }
    if (updatedID !== -1) {
      patchResource();
    }
  }, [fetchData, apiRoute, apiPath, csrfToken, updatedID, setUpdatedID, patch, setError, resources, setResources]);

  function updateResource(id: number, patch: Partial<Resource>): void {
    setResources(
      resources.map((resource) => {
        if (resource.id === id) {
          return { ...resource, ...patch };
        } else {
          return resource;
        }
      })
    );
    setPatch(patch);
    setUpdatedID(id);
  }

  return { updateResource, updated: updatedID === -1, error };
}