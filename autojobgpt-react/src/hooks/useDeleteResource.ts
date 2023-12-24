import React, { useState, useCallback } from "react";

import useApiCall, { OnSuccessParams, AfterCallParams } from "./useApiCall";
import { WithId } from '../api/types';


export interface UseDeleteResource {
  deleteResource: (id: number) => void,
  idsBeingDeleted: number[],
};

const useDeleteResource = <Resource extends WithId>(
  apiPath: string,
  resources: Resource[],
  setResources: React.Dispatch<React.SetStateAction<Resource[]>>,
  options?: {
    onSuccess?: (deletedResource: Resource, setResources: React.Dispatch<React.SetStateAction<Resource[]>>) => void,
    onFail?: (errors: Record<string,string[]>) => void,
  },
): UseDeleteResource => {
  const { onSuccess, onFail } = options || {};

  const [idsBeingDeleted, setIdsBeingDeleted] = useState<number[]>([]);

  const handleSuccess = useCallback(async ({resourceId}: OnSuccessParams): Promise<void> => {
    const updateResources = (resources: Resource[]): Resource[] => {
      return resources.filter((resource) => resource.id !== resourceId);
    }
    setResources(updateResources);
    const deletedResource: Resource = resources.find((resource) => resource.id === resourceId)!;
    onSuccess?.(deletedResource, setResources);
  }, [resources, setResources, onSuccess]);

  const afterCall = useCallback(({resourceId}: AfterCallParams): void => {
    setIdsBeingDeleted((idsBeingDeleted) =>
      idsBeingDeleted.filter((idBeingDeleted) => idBeingDeleted !== resourceId)
    );
  }, []);

  const { call } = useApiCall("DELETE", {
    apiPath,
    onSuccess: handleSuccess,
    onFail,
    afterCall,
  });

  const deleteResource = useCallback((id: number): void => {
    setIdsBeingDeleted((idsBeingDeleted) => [...idsBeingDeleted, id]);
    call({resourceId: id});    
  }, [call]);
  
  return { deleteResource, idsBeingDeleted };
};

export default useDeleteResource;