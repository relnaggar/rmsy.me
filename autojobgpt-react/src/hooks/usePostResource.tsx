import React, { useContext, useState, useEffect } from "react";

import useAPI from "./useAPI";
import { FetchDataContext } from "../routes/routesConfig";
import { CSRFTokenContext } from "../routes/Layout";
import { WithID } from "../common/types";
import { makeErrorMessage } from "./hooksUtils";


const usePostResource = <Resource extends WithID, ResourceUpload>(
  apiPath: string,
  resources: Resource[],
  setResources: React.Dispatch<React.SetStateAction<Resource[]>>,
  getPlaceholderResource: (resourceUpload: ResourceUpload) => Resource,
  options?: {
    onSuccess?: (resource: Resource) => void,
    onFail?: (errors: Record<string,string[]>) => void,
  },
): {
  posting: boolean,
  postResource: (resource: ResourceUpload) => void,
} => {
  const { onSuccess, onFail } = options || {};

  const apiRoute: string = useAPI();
  const fetchData = useContext(FetchDataContext);
  const csrfToken = useContext(CSRFTokenContext);

  const [resourceBeingPosted, setResourceBeingPosted] = useState<ResourceUpload | null>(null);

  useEffect(() => {
    const doPost = async (body: FormData | string): Promise<void> => {      
      let errors: Record<string,string[]> = {};
      const newResources: Resource[] = [...resources.filter(resource => resource.id !== -1)];
      try {
        const csrfHeader: HeadersInit = {
          "X-CSRFToken": csrfToken,
        };
        const response: Response = await fetchData(`${apiRoute}${apiPath}`, {
          method: "POST",
          // if the body is a FormData then we shouldn't set the Content-Type header
          headers: body instanceof FormData ? csrfHeader : { ...csrfHeader, "Content-Type": "application/json" },
          body: body
        });
        
        // wait for 3 seconds before continuing
        // await new Promise(resolve => setTimeout(resolve, 3000));

        if (response.ok) {
          const resource: Resource = await response.json();
          newResources.push(resource);
          onSuccess?.(resource);
        } else {
          errors = await response.json();
        }
      } catch (error) {
        errors["error"] = makeErrorMessage(error);
      } finally {
        setResources(newResources);
        setResourceBeingPosted(null);
        if (Object.keys(errors).length > 0) {
          onFail?.(errors);
        }
      }
    };
    if (resourceBeingPosted !== null) {
      const formData = new FormData();
      let containsFile = false;
      for (const [key, value] of Object.entries(resourceBeingPosted!)) {
        if (value instanceof File) {
          containsFile = true;          
        }
        formData.append(key, value);
      }
      if (containsFile) {
        // if the addedResource contains a file, then we need to use FormData
        doPost(formData);
      } else {
        // otherwise we should use JSON
        doPost(JSON.stringify(resourceBeingPosted));
      }
    }
  }, [fetchData, apiRoute, apiPath, csrfToken, resourceBeingPosted, resources, onSuccess, onFail, setResources]);

  const postResource = (resourceUpload: ResourceUpload): void => {
    const placeHolderResource: Resource = getPlaceholderResource(resourceUpload);
    if (placeHolderResource.id !== -1) {
      throw new Error("Placeholder resource must have an id of -1");
    }
    setResources([...resources, placeHolderResource]);
    setResourceBeingPosted(resourceUpload);
  };

  return { posting: resourceBeingPosted !== null, postResource };
};

export default usePostResource;