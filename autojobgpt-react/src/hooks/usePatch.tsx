import React, { useContext, useEffect, useState } from "react";

import useAPI from "./useAPI";
import { FetchDataContext } from "../routes/routesConfig";
import { CSRFTokenContext } from "../routes/Layout";
import { WithID } from "../common/types";
import { makeErrorMessage } from "./hooksUtils";


export default function usePatch<Resource extends WithID>(
  apiPath: string,
  resources: Resource[],
  setResources: React.Dispatch<React.SetStateAction<Resource[]>>,
  options?: {
    onSuccess?: (resource: Resource, resources: Resource[], setResources: React.Dispatch<React.SetStateAction<Resource[]>>) => void,
    onFail?: (errors: Record<string,string>) => void,
  },
): {
  patching: boolean,
  patchResource: (id: number, patch: Partial<Resource>) => void,
} {
  const {
    onSuccess,
    onFail,
  } = options || {};

  const apiRoute: string = useAPI();
  const fetchData = useContext(FetchDataContext);
  const csrfToken = useContext(CSRFTokenContext);

  const [idBeingPatched, setIDBeingPatched] = useState<number>(-1);
  const [patch, setPatch] = useState<Partial<Resource>>({});

  useEffect(() => {
    async function doPatch(): Promise<void> {
      let errors: Record<string,string> = {};
      try {
        const response: Response = await fetchData(`${apiRoute}${apiPath}${idBeingPatched}/`, { 
          method: "PATCH", 
          headers: { "X-CSRFToken": csrfToken, "Content-Type": "application/json" },
          body: JSON.stringify(patch)
        });

        // wait for 3 seconds before continuing
        // await new Promise(resolve => setTimeout(resolve, 3000));

        if (response.ok) {
          const patchedResource: Resource = await response.json();
          setResources(resources.map((resource) => resource.id === idBeingPatched ? patchedResource : resource));
          onSuccess?.(patchedResource, resources, setResources);
        } else {          
          errors = await response.json();
        }
      } catch (error) {
        errors["error"] = makeErrorMessage(error);
      } finally {    
        setIDBeingPatched(-1);
        if (Object.keys(errors).length > 0) {
          onFail?.(errors);
        }
      }
    }
    if (idBeingPatched !== -1) {
      doPatch();
    }
  }, [fetchData, apiRoute, apiPath, csrfToken, idBeingPatched, patch, resources, setResources, onSuccess, onFail]);

  function patchResource(id: number, patch: Partial<Resource>): void {
    setPatch(patch);
    setIDBeingPatched(id);
  }

  return { patching: idBeingPatched !== -1, patchResource };
}