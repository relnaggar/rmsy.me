import React, { useState, useEffect } from 'react';

import DocumentList from '../common/DocumentList';
import { RemoveDocumentContext } from '../common/DocumentThumbnail';
import { Resume, ResumeUpload } from './types';


export default function ResumeList({ fetchData, resumes, setResumes, addedResume, setAddedResume }: {
  fetchData: (input: RequestInfo, init?: RequestInit | undefined) => Promise<Response>,
  resumes: Resume[],
  setResumes: React.Dispatch<React.SetStateAction<Resume[]>>,
  addedResume: ResumeUpload | null,
  setAddedResume: React.Dispatch<React.SetStateAction<ResumeUpload | null>>
}): React.JSX.Element { 
  const [resumesLoaded, setResumesLoaded] = useState<boolean>(false);
  const [removedResumeId, setRemovedResumeId] = useState<number>(-1);

  useEffect(() => {
    async function getResumes(): Promise<void> {
      await fetchData('../api/resumes/')
      .then(response => response.json())
      .then(data => setResumes(data))
      .catch(error => console.error('Error:', error))
      .finally(() => setResumesLoaded(true));
    }
    getResumes()    
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function removeResume(id: number): void {
    setResumes(resumes.filter((resume) => resume.id !== id));
    setRemovedResumeId(id);
  }

  useEffect(() => {
    async function deleteResume(): Promise<void> {
      await fetchData(`../api/resumes/${removedResumeId}/`, { 
        method: "DELETE", 
        headers: { "Content-Type": "application/json" },
      })
      .then((response) => response.status === 204 && setRemovedResumeId(-1))
      .catch((error) => console.error("Error:", error));
    }
    if (removedResumeId !== -1) {
      deleteResume();
    }
  }, [removedResumeId]); // eslint-disable-line react-hooks/exhaustive-deps

  return(
    <section>
      <h2>Resumes</h2>
      <RemoveDocumentContext.Provider value={removeResume}>
        <DocumentList documents={resumes} areDocumentsLoaded={resumesLoaded} />
      </RemoveDocumentContext.Provider>
    </section>
  )
}