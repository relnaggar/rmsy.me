import React, { useState, useEffect } from "react";

import { WithID } from "../common/types";
import { FetchData } from "../routes/types";


export default function usePost<Resource extends WithID, ResourceUpload>(
  fetchData: FetchData,
  apiPath: string,
  resources: Resource[],
  setResources: React.Dispatch<React.SetStateAction<Resource[]>>,
  getPlaceholderResource: (resourceUpload: ResourceUpload) => Resource,
): {
  addResource: (resource: ResourceUpload) => void,
  error: string,
} {
  const [addedResourceUpload, setAddedResourceUpload] = useState<ResourceUpload | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    async function postResource(): Promise<void> {
      await fetchData(apiPath, { 
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addedResourceUpload),   
      })
      .then((response) => response.json())
      .then((data) => {
        // replace placeholder resource with resource from server
        setResources([
          ...resources.filter((resource) => resource.id !== -1),
          data
        ]);
        setAddedResourceUpload(null);
      })
      .catch((error) => setError(error.message));
    }
    if (addedResourceUpload !== null) {
      postResource();
    }
  }, [fetchData, apiPath, addedResourceUpload, resources, setResources]);

  function addResource(resourceUpload: ResourceUpload): void {
    const placeHolderResource: Resource = getPlaceholderResource(resourceUpload);
    if (placeHolderResource.id !== -1) {
      throw new Error("Placeholder resource must have an id of -1");
    }
    setResources([...resources, placeHolderResource]);
    setAddedResourceUpload(resourceUpload);
  }

  return { addResource, error };
}