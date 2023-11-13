import React, { useContext, useState, useEffect } from "react";

import useAPI from "./useAPI";
import { FetchDataContext } from "../routes/routesConfig";
import { CSRFTokenContext } from "../routes/Layout";
import { WithID } from "../common/types";


export default function usePost<Resource extends WithID, ResourceUpload>(
  apiPath: string,
  resources: Resource[],
  setResources: React.Dispatch<React.SetStateAction<Resource[]>>,
  getPlaceholderResource: (resourceUpload: ResourceUpload) => Resource,
): {
  addResource: (resource: ResourceUpload) => void,
  error: string,
} {
  const apiRoute: string = useAPI();
  const fetchData = useContext(FetchDataContext);
  const csrfToken = useContext(CSRFTokenContext);
  
  const [addedResourceUpload, setAddedResourceUpload] = useState<ResourceUpload | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    async function postResource(body: FormData | string): Promise<void> {
      const headers: HeadersInit = {
        "X-CSRFToken": csrfToken,
      };
      
      await fetchData(`${apiRoute}${apiPath}`, { 
        method: "POST", 
        // if the body is a FormData, then we don't need to set the Content-Type header
        headers: body instanceof FormData ? headers : { ...headers, "Content-Type": "application/json" },
        body: body
      })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          setError(`${data.error}: ${data.details}`);
          console.error(`${data.error}: ${data.details}`);
        } else {
          setResources([...resources.filter((resource) => resource.id !== -1), data]);
          setAddedResourceUpload(null);
          setError("");
        }
      })
      .catch(error => {
        setError(error.message);
        console.error(error.message);
      });
    }
    if (addedResourceUpload !== null) {
      const formData = new FormData();
      let containsFile = false;
      for (const [key, value] of Object.entries(addedResourceUpload!)) {
        if (value instanceof File) {
          containsFile = true;          
        }
        formData.append(key, value);
      }
      if (containsFile) {
        // if the addedResource contains a file, then we need to use FormData
        postResource(formData);
      } else {
        // otherwise we should use JSON
        postResource(JSON.stringify(addedResourceUpload));
      }
    }
  }, [fetchData, apiRoute, apiPath, csrfToken, addedResourceUpload, resources, setResources, setError]);

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