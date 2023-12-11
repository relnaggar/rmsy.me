import React, { useContext, useEffect, useState } from "react";

import useAPI from "./useAPI";
import { FetchDataContext } from "../routes/routesConfig";
import { CSRFTokenContext } from "../routes/Layout";
import { WithId } from '../api/types';
import { makeErrorMessage } from "./hooksUtils";


export interface UseDeleteResource {
  deleteResource: (id: number) => void,
  idBeingDeleted: number,
};

const useDeleteResource = <Resource extends WithId>(
  apiPath: string,
  resources: Resource[],
  setResources: React.Dispatch<React.SetStateAction<Resource[]>>,
  options?: {
    onSuccess?: (deletedResource: Resource, resources: Resource[], setResources: React.Dispatch<React.SetStateAction<Resource[]>>) => void,
    onFail?: (errors: Record<string,string[]>) => void,
  },
): UseDeleteResource => {
  const { onSuccess, onFail } = options || {};

  const apiRoute: string = useAPI();
  const fetchData = useContext(FetchDataContext);
  const csrfToken = useContext(CSRFTokenContext);

  const [idBeingDeleted, setIdBeingDeleted] = useState<number>(-1);

  useEffect(() => {
    const doDelete = async (): Promise<void> => {
      let errors: Record<string,string[]> = {};
      try {
        const response: Response = await fetchData(`${apiRoute}${apiPath}${idBeingDeleted}/`, { 
          method: "DELETE", 
          headers: { "X-CSRFToken": csrfToken, "Content-Type": "application/json" },
        })

        // wait for 3 seconds before continuing
        // await new Promise(resolve => setTimeout(resolve, 3000));

        if (response.ok) {
          const deletedResource: Resource = resources.find((resource) => resource.id === idBeingDeleted)!;
          const newResources: Resource[] = resources.filter((resource) => resource.id !== idBeingDeleted);
          setResources(newResources);
          onSuccess?.(deletedResource, newResources, setResources);
        } else {
          errors = await response.json();
          if (!String(errors)) {
            errors = {error: makeErrorMessage(response.statusText)};
          }
        }
      } catch (error) {
        errors["error"] = makeErrorMessage(error);
      } finally {
        setIdBeingDeleted(-1);
        if (Object.keys(errors).length > 0) {
          onFail?.(errors);
        }
      }
    };
    if (idBeingDeleted !== -1) {
      doDelete();
    }
  }, [fetchData, apiRoute, apiPath, csrfToken, idBeingDeleted, resources, onSuccess, onFail, setResources]);

  const deleteResource = (id: number): void => {
    if (idBeingDeleted !== -1) {
      return;
    }    
    setIdBeingDeleted(id);
  };
  
  return { deleteResource, idBeingDeleted };
};

export default useDeleteResource;