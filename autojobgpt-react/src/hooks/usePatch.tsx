import React, { useEffect, useState } from "react";

import { FetchData } from "../routes/types";
import { WithID } from "../common/types";


export default function usePatch<Resource extends WithID>(
  fetchData: FetchData,
  apiPath: string,
  resources: Resource[],
  setJobs: React.Dispatch<React.SetStateAction<Resource[]>>
): {
  updateResource: (id: number, patch: Partial<Resource>) => void,
  error: string
} {
  const [updatedId, setUpdatedId] = useState<number>(-1);
  const [patch, setPatch] = useState<Partial<Resource>>({});
  const [error, setError] = useState<string>("");

  useEffect(() => {
    async function patchResource(): Promise<void> {
      await fetchData(`${apiPath}${updatedId}/`, { 
        method: "PATCH", 
        headers: { "Content-Type": "application/json" },
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
  }, [fetchData, apiPath, updatedId, setUpdatedId, patch, setError]);

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