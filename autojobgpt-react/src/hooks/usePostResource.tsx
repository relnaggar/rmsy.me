import React from "react";

import useApiCall from "./useApiCall";
import { WithId } from "../api/types";


export interface UsePostResource<ResourceUpload> {
  posting: boolean,
  postResource: (resource: ResourceUpload) => Promise<void>,
  cancel: () => void,
};

const usePostResource = <Resource extends WithId, ResourceUpload>(
  apiPath: string,
  resources: Resource[],
  setResources: React.Dispatch<React.SetStateAction<Resource[]>>,
  getPlaceholderResource: (resourceUpload: ResourceUpload) => Resource,
  options?: {
    onSuccess?: (newResource: Resource, resources: Resource[], setResources: React.Dispatch<React.SetStateAction<Resource[]>>) => void,
    onFail?: (errors: Record<string,string[]>) => void,
  },
): UsePostResource<ResourceUpload> => {
  const { onSuccess, onFail } = options || {};

  const beforeCall = (resourceUpload: ResourceUpload): Resource[] => {
    const placeHolderResource: Resource = getPlaceholderResource(resourceUpload);
    if (placeHolderResource.id !== -1) {
      throw new Error("Placeholder resource must have an id of -1");
    }
    setResources([...resources, placeHolderResource]);    

    const newResources = [...resources];
    return newResources;
  };

  const handleSuccess = async (response: Response, newResources: Resource[]): Promise<void> => {
    const resource: Resource = await response.json();
    newResources.push(resource);
    onSuccess?.(resource, newResources, setResources);
  };

  const afterCall = (newResources: Resource[]): void => {
    setResources(newResources);
  };

  const { calling: posting, call, cancel } = useApiCall<Resource>(apiPath, "POST", {
    beforeCall,
    onSuccess: handleSuccess,
    afterCall,
    onFail
  });

  const postResource = async (resourceUpload: ResourceUpload): Promise<void> => {
    await call(resourceUpload);
  }

  return { posting, postResource, cancel };
};

export default usePostResource;