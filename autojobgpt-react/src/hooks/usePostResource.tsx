import React, { useRef, useCallback } from "react";

import useApiCall, { OnSuccessParams } from "./useApiCall";
import { WithId } from "../api/types";


export interface UsePostResource<ResourceUpload> {
  posting: boolean,
  postResource: (resource: ResourceUpload) => Promise<void>,
};

const usePostResource = <Resource extends WithId, ResourceUpload>(
  apiPath: string,
  resources: Resource[],
  setResources: React.Dispatch<React.SetStateAction<Resource[]>>,
  getPlaceholderResource: (resourceUpload: ResourceUpload) => Resource,
  options?: {
    onSuccess?: (resource: Resource) => void,
    onFail?: (errors: Record<string,string[]>) => void,
  },
): UsePostResource<ResourceUpload> => {
  const { onSuccess, onFail } = options || {};

  const newResources = useRef<Resource[]>([]);

  const beforeCall = useCallback((resourceUpload: ResourceUpload): void => {
    const placeHolderResource: Resource = getPlaceholderResource(resourceUpload);
    if (placeHolderResource.id !== -1) {
      throw new Error("Placeholder resource must have an id of -1");
    }
    newResources.current = [...resources];
    setResources((resources) => [...resources, placeHolderResource]);
  }, [resources, setResources, getPlaceholderResource]);

  const handleSuccess = useCallback(async ({response}: OnSuccessParams): Promise<void> => {
    const resource: Resource = await response.json();
    newResources.current = [...newResources.current, resource];
    onSuccess?.(resource);
  }, [onSuccess]);

  const afterCall = useCallback((): void => {
    setResources(newResources.current);
  }, [setResources]);

  const { calling: posting, call } = useApiCall(apiPath, "POST", {
    beforeCall,
    onSuccess: handleSuccess,
    afterCall,
    onFail
  });

  const postResource = useCallback(async (resourceUpload: ResourceUpload): Promise<void> => {
    await call({data: resourceUpload});
  }, [call]);

  return { posting, postResource };
};

export default usePostResource;