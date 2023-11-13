import React, { useContext, useEffect, useState } from "react";

import useAPI from "./useAPI";
import { FetchDataContext } from "../routes/routesConfig";
import { CSRFTokenContext } from "../routes/Layout";
import { WithID } from "../common/types";


export default function useDelete<Resource extends WithID>(
  apiPath: string,
  resources: Resource[],
  setResources: React.Dispatch<React.SetStateAction<Resource[]>>,
): {
  removeResource: (id: number) => void,
  removedID: number,
  error: string
} {
  const apiRoute: string = useAPI();
  const fetchData = useContext(FetchDataContext);
  const csrfToken = useContext(CSRFTokenContext);

  const [removedID, setRemovedID] = useState<number>(-1);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    async function deleteResource(): Promise<void> {
      await fetchData(`${apiRoute}${apiPath}${removedID}/`, { 
        method: "DELETE", 
        headers: { "X-CSRFToken": csrfToken, "Content-Type": "application/json" },
      })
      .then((response) => {
        if (response.status === 204) {
          setResources(resources.filter((resource) => resource.id !== removedID));
          setRemovedID(-1);
          setError("");
        } else {
          response.json()
          .then(data => {
            setError(`${data.error}: ${data.details}`);
            console.error(`${data.error}: ${data.details}`);
          })
          .catch(error => {
            setError(error.message);
            console.error(error.message);
          });
        }
      })
      .catch((error) => setError(error.message));
    }
    if (removedID !== -1) {
      deleteResource();
    }
  }, [fetchData, apiRoute, apiPath, csrfToken, removedID, setRemovedID, setError, resources, setResources]);

  function removeResource(id: number): void {
    setRemovedID(id);
  }
  
  return { removeResource, removedID, error };
}