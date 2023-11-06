import React, { useContext, useState, useEffect } from 'react';

import DocumentList from '../common/DocumentList';
import { RemoveDocumentContext } from '../common/DocumentThumbnail';
import { FetchDataContext } from "../routes/routesConfig";
import { Resume, ResumeUpload } from './types';


export default function ResumeList({ resumes, setResumes, addedResume, setAddedResume }: {
  resumes: Resume[],
  setResumes: React.Dispatch<React.SetStateAction<Resume[]>>,
  addedResume: ResumeUpload | null,
  setAddedResume: React.Dispatch<React.SetStateAction<ResumeUpload | null>>
}): React.JSX.Element { 
  const fetchData = useContext(FetchDataContext);

  const [resumesLoaded, setResumesLoaded] = useState<boolean>(false);
  const [removedResumeId, setRemovedResumeId] = useState<number>(-1);

  useEffect(() => {
    async function getResumes(): Promise<void> {
      await fetchData("../api/resumes/", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })
      .then(response => response.json())
      .then(data => setResumes(data))
      .catch(error => console.error("Error:", error))
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

  // add template to server if addedTemplate is changed to a non-null value
  useEffect(() => {
    async function postResume(): Promise<void> {
      await fetchData("../api/resumes/", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          "job": addedResume?.job,
          "template": addedResume?.template,
        }),        
      })
      .then((response) => response.json())
      .then((data) => {
        // replace placeholder resume with resume from server
        setResumes([
          ...resumes.filter((resume) => resume.id !== -1),
          data
        ]);
        // resume has been added so set addedResume to null
        setAddedResume(null);
      })
      .catch((error) => console.error("Error:", error));
    }
    if (addedResume !== null) {
      postResume();
    }
  }, [addedResume]); // eslint-disable-line react-hooks/exhaustive-deps

  return(
    <section>
      <h2>Resumes</h2>
      <RemoveDocumentContext.Provider value={removeResume}>
        <DocumentList documents={resumes} documentsLoaded={resumesLoaded} />
      </RemoveDocumentContext.Provider>
    </section>
  )
}