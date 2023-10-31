import React, { useState, useEffect } from 'react';

import DocumentList from '../common/DocumentList';
import { RemoveDocumentContext } from '../common/DocumentThumbnail';
import { ModalContext } from '../common/AddDocument';
import { Resume } from './types';


export function ResumesSection({ fetchData, resumes, setResumes, addedResume, setAddedResume }: {
  fetchData: (input: RequestInfo, init?: RequestInit | undefined) => Promise<Response>,
  resumes: Resume[],
  setResumes: React.Dispatch<React.SetStateAction<Resume[]>>,
  addedResume: Resume | null,
  setAddedResume: React.Dispatch<React.SetStateAction<Resume | null>>
}): React.JSX.Element { 
  const [removedResumeId, setRemovedResumeId] = useState<number>(-1);

  useEffect(() => {
    async function getResumes(): Promise<void> {
      fetchData('../api/resumes/')
      .then(response => response.json())
      .then(data => 
        setResumes(data)
      )
    }
    getResumes()    
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    async function deleteTemplate(): Promise<void> {
      await fetchData(`../api/resumes/${removedResumeId}/`, { 
        method: "DELETE", 
        headers: { "Content-Type": "application/json" },
      })
      .then((response) => response.status === 204 && setRemovedResumeId(-1))
      .catch((error) => console.error("Error:", error));
    }
    if (removedResumeId !== -1) {
      deleteTemplate();
    }
  }, [removedResumeId]); // eslint-disable-line react-hooks/exhaustive-deps

  function removeResume(pk: string | number): void {
    setResumes(resumes.filter((resume) => resume.id !== pk));
    setRemovedResumeId(pk as number);
  }

  return(
    <section>
      <h2>Resumes</h2>
      <RemoveDocumentContext.Provider value={removeResume}>
        <ModalContext.Provider value={{modalId: "addResumeModal", modalFocusId: "TODO"}}>
          <DocumentList
            documents={resumes}
            areDocumentsLoaded={true}
            addButtonText="Generate new resume"
          />
        </ModalContext.Provider>
      </RemoveDocumentContext.Provider>
    </section>
  )
}

export function AddResumeModal({ addResume }: {
  addResume: (resume: Resume) => void
}): React.JSX.Element {
  // TODO
  // const [job, setJob] = useState<Job | null>(null);
  // const [template, setTemplate] = useState<string>("");

  // function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
  //   event.preventDefault();
  //   if (job && template) {
  //     addResume(new Resume({
  //       id: -1,
  //       substitutions: [],
  //       version: -1,
  //       docx: "",
  //       png: "",
  //       chat_messages: [],
  //       job: job,
  //       template: template
  //     }));
  //   }
  // }

  return (
    <></>
    // TODO
    // <form onSubmit={handleSubmit}>
    //   <h3>Generate new resume</h3>
    //   <label htmlFor="job">Job</label>
    //   <input
    //     id="job"
    //     type="text"
    //     value={job ? job.title + ", " + job.company : ""}
    //     onChange={(event) => setJob(JSON.parse(event.target.value))}
    //     required
    //   />
    //   <label htmlFor="template">Template</label>
    //   <input
    //     id="template"
    //     type="text"
    //     value={template}
    //     onChange={(event) => setTemplate(event.target.value)}
    //     required
    //   />
    //   <button type="submit">Generate</button>
    // </form>
  );
}