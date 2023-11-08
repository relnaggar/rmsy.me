import { useState, useEffect } from 'react';

import { FetchData } from '../../routes/types';
import { Resume } from '../types';


export default function useFetchResumes(fetchData: FetchData): {
  resumes: Resume[],
  setResumes: React.Dispatch<React.SetStateAction<Resume[]>>,
  resumesLoaded: boolean,
  error: string
} {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [resumesLoaded, setResumesLoaded] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    async function getResumes(): Promise<void> {
      await fetchData("../api/resumes/", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })
      .then(response => response.json())
      .then(data => setResumes(data))
      .catch(error => setError(error.message))
      .finally(() => setResumesLoaded(true));
    }
    getResumes();
  }, [fetchData]);

  return { resumes, setResumes, resumesLoaded, error };
}