import { useState, useEffect } from 'react';

import { FetchData } from '../routes/types';


export default function useFetch<Resource>(fetchData: FetchData, apiPath: string): {
  resources: Resource[],
  setResources: React.Dispatch<React.SetStateAction<Resource[]>>,
  loaded: boolean,
  error: string
} {
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
    getResources();
  }, [fetchData, apiPath, setResources, setError, setLoaded]);

  return { resources, setResources, loaded, error };
}