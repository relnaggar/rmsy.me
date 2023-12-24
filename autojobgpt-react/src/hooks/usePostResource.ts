import React, { useCallback } from "react";

import useApiCall, { OnSuccessParams } from "./useApiCall";
import { WithId } from "../api/types";
import { removeOnePlaceholderResource } from "../common/utils";


export interface UsePostResource<ResourceUpload> {
  posting: boolean,
  postResource: (resource: ResourceUpload) => Promise<void>,
};

const usePostResource = <Resource extends WithId, ResourceUpload>(
  apiPath: string,
  setResources: React.Dispatch<React.SetStateAction<Resource[]>>,
  getPlaceholderResource: (resourceUpload: ResourceUpload) => Resource,
  options?: {
    onSuccess?: (resource: Resource) => void,
    onFail?: (errors: Record<string,string[]>) => void,
  },
): UsePostResource<ResourceUpload> => {
  const { onSuccess, onFail } = options || {};

  const beforeCall = useCallback((resourceUpload: ResourceUpload): void => {
    const placeHolderResource: Resource = getPlaceholderResource(resourceUpload);
    if (placeHolderResource.id !== -1) {
      throw new Error("Placeholder resource must have an id of -1");
    }
    setResources((resources) => [...resources, placeHolderResource]);
  }, [setResources, getPlaceholderResource]);

  const handleSuccess = useCallback(async ({response}: OnSuccessParams): Promise<void> => {
    const resource: Resource = await response.json();
    setResources((resources) => [...resources, resource]);
    onSuccess?.(resource);
  }, [setResources, onSuccess]);

  const afterCall = useCallback((): void => {
    removeOnePlaceholderResource(setResources);
  }, [setResources]);

  const { calling: posting, call } = useApiCall("POST", {
    apiPath,
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