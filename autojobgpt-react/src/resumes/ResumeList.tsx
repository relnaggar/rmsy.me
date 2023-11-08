import React, { useState } from 'react';

import useResource from '../hooks/useResource';
import DocumentList from '../common/DocumentList';
import GenerateResumeModal from './GenerateResumeModal';
import { Resume, ResumeUpload } from './types';


export default function ResumeList(): React.JSX.Element { 
  function getPlaceholderResume(resumeUpload: ResumeUpload): Resume {
    return {
      id: -1,
      substitutions: [],
      version: -1,
      docx: "",
      png: "",
      chat_messages: [],
      job: resumeUpload.job,
      template: resumeUpload.template,
      name: "",
    }
  };
  const {
    resources: resumes,
    loaded: resumesLoaded,
    removeResource: removeResume,
    addResource: addResume,
    errors
  } = useResource<Resume,ResumeUpload>("../api/resumes/", getPlaceholderResume);

  const [showGenerateResume, setShowGenerateResume] = useState<boolean>(false);  

  function handleClickEditResume(id: number): void {
    console.log(`edit resume ${id}`);
  }
  function handleClickAddResume(): void {
    setShowGenerateResume(true);
  }  

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