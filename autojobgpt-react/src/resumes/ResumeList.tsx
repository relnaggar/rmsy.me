import React, { useContext, useState, useEffect } from 'react';

import { FetchDataContext } from "../routes/routesConfig";
import DocumentList from '../common/DocumentList';
import GenerateResumeModal from './GenerateResumeModal';
import useFetchResumes from './hooks/useFetchResumes';
import useDeleteResume from './hooks/useDeleteResume';
import { Resume, ResumeUpload } from './types';


export default function ResumeList(): React.JSX.Element { 
  const fetchData = useContext(FetchDataContext);
  
  const { resumes, setResumes, resumesLoaded, error: fetchError } = useFetchResumes(fetchData);
  const { setRemovedResumeId, error: deleteError } = useDeleteResume(fetchData);

  function handleClickEditResume(id: number): void {
    console.log(`edit resume ${id}`);
  }
  
  function removeResume(id: number): void {
    setResumes(resumes.filter((resume) => resume.id !== id));
    setRemovedResumeId(id);
  }

  const [addedResume, setAddedResume] = useState<ResumeUpload | null>(null);
  const [showGenerateResume, setShowGenerateResume] = useState<boolean>(false);
  function handleClickAddResume(): void {
    setShowGenerateResume(true);
  }
  function addResume(resume: ResumeUpload): void {
    // add placeholder resume to resumes state
    const placeholderResume: Resume = {
      id: -1,
      substitutions: [],
      version: -1,
      docx: "",
      png: "",
      chat_messages: [],
      job: resume.job,
      template: resume.template,
      name: "",
    };
    setResumes([...resumes, placeholderResume]);

    // queue resume to be added to server
    setAddedResume(resume);
  }
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
      <DocumentList
        documents={resumes}
        documentsLoaded={resumesLoaded}
        onClickEditDocument={handleClickEditResume}
        onClickRemoveDocument={removeResume}
        onClickAddDocument={handleClickAddResume}
        addButtonText="Generate new resume"
      />
      <GenerateResumeModal show={showGenerateResume} setShow={setShowGenerateResume} addResume={addResume} />
    </section>
  )
}