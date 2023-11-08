import { useContext, useState, useEffect } from 'react';

import { FetchDataContext } from "../routes/routesConfig";


export default function useFetch<Resource>(apiPath: string): {
  resources: Resource[],
  setResources: React.Dispatch<React.SetStateAction<Resource[]>>,
  loaded: boolean,
  setLoaded: React.Dispatch<React.SetStateAction<boolean>>,
  error: string
} {
  const fetchData = useContext(FetchDataContext);

  const [resources, setResources] = useState<Resource[]>([]);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    async function getResources(): Promise<void> {
      await fetchData(apiPath, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })
      .then(response => response.json())
      .then(data => setResources(data))
      .catch(error => setError(error.message))
      .finally(() => setLoaded(true));
    }
    if (!loaded) {
      getResources();
    }
  }, [fetchData, apiPath, loaded, setResources, setError, setLoaded]);

  return { resources, setResources, loaded, setLoaded, error };
}