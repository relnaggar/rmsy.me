import React, { useContext, useEffect, useState } from "react";

import { FetchDataContext } from "../routes/routesConfig";
import { WithID } from "../common/types";


export default function useDelete<Resource extends WithID>(
  apiPath: string,
  resources: Resource[],
  setResources: React.Dispatch<React.SetStateAction<Resource[]>>,
): {
  removeResource: (id: number) => void,
  error: string
} {
  const fetchData = useContext(FetchDataContext);

  const [removedId, setRemovedId] = useState<number>(-1);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    async function deleteResource(): Promise<void> {
      await fetchData(`${apiPath}${removedId}/`, { 
        method: "DELETE", 
        headers: { "Content-Type": "application/json" },
      })
      .then((response) => response.status === 204 && setRemovedId(-1))
      .catch((error) => setError(error));
    }
    if (removedId !== -1) {
      deleteResource();
    }
  }, [fetchData, apiPath, removedId, setRemovedId, setError]);

  function removeResource(id: number): void {
    setResources(resources.filter((resource) => resource.id !== id));
    setRemovedId(id);
  }
  
  return { removeResource, error };
}