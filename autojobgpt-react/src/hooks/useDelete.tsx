import { useEffect, useState } from "react";

import { WithID } from "../common/types";
import { FetchData } from "../routes/types";


export default function useDelete<Resource extends WithID>(
  fetchData: FetchData,
  apiPath: string,
  resources: Resource[],
  setResources: React.Dispatch<React.SetStateAction<Resource[]>>,
): {
  removeResource: (id: number) => void,
  error: string
} {
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
  }, [fetchData, apiPath, removedId]);

  function removeResource(id: number): void {
    setResources(resources.filter((resource) => resource.id !== id));
    setRemovedId(id);
  }
  
  return { removeResource, error };
}