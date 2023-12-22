import React, { useState, useCallback } from "react";

import useApiCall, { OnSuccessParams, AfterCallParams } from "./useApiCall"
import { WithId } from '../api/types';


export interface UsePatchResource<Resource> {
  patching: boolean,
  patchResource: (id: number, patch: Partial<Resource>) => void,
};

const usePatchResource = <Resource extends WithId>(
  apiPath: string,
  resources: Resource[],
  setResources: React.Dispatch<React.SetStateAction<Resource[]>>,
  options?: {
    onSuccess?: (oldResource: Resource, setResources: React.Dispatch<React.SetStateAction<Resource[]>>) => void,
    onFail?: (errors: Record<string,string[]>) => void,
  },
): UsePatchResource<Resource> => {
  const { onSuccess, onFail } = options || {};

  const [idsBeingPatched, setIdsBeingPatched] = useState<number[]>([]);

  const handleSuccess = useCallback(async ({ response, resourceId }: OnSuccessParams): Promise<void> => {
    const patchedResource: Resource = await response.json();
    const oldResource: Resource = resources.find((resource) => resource.id === resourceId)!;
    setResources((resources) => resources.map(
      (resource) => resource.id === resourceId ? patchedResource : resource
    ));
    onSuccess?.(oldResource, setResources);
  }, [resources, setResources, onSuccess]);

  const afterCall = useCallback(({ resourceId }: AfterCallParams): void => {
    setIdsBeingPatched((idsBeingPatched) => idsBeingPatched.filter((idBeingPatched) => idBeingPatched !== resourceId));
  }, []);
  
  const { call } = useApiCall(apiPath, "PATCH", { onSuccess: handleSuccess, afterCall, onFail });

  const patchResource = useCallback((id: number, patchData: Partial<Resource>): void => {
    setIdsBeingPatched((idsBeingPatched) => [...idsBeingPatched, id]);
    call({data: patchData, resourceId: id});    
  }, [call]);

  return { patching: idsBeingPatched.length !== 0, patchResource };
};

export default usePatchResource;