import { useEffect, useState } from "react";

import { Resume } from "../types";


export default function useDeleteResume(
  fetchData: (input: RequestInfo, init?: RequestInit | undefined) => Promise<Response>,
  resumes: Resume[],
  setResumes: React.Dispatch<React.SetStateAction<Resume[]>>,
): {
  removeResume: (id: number) => void,
  error: string
} {
  const [removedResumeId, setRemovedResumeId] = useState<number>(-1);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    async function deleteResume(): Promise<void> {
      await fetchData(`../api/resumes/${removedResumeId}/`, { 
        method: "DELETE", 
        headers: { "Content-Type": "application/json" },
      })
      .then((response) => response.status === 204 && setRemovedResumeId(-1))
      .catch((error) => setError(error));
    }
    if (removedResumeId !== -1) {
      deleteResume();
    }
  }, [fetchData, removedResumeId]);

  function removeResume(id: number): void {
    setResumes(resumes.filter((resume) => resume.id !== id));
    setRemovedResumeId(id);
  }
  
  return { removeResume, error };
}