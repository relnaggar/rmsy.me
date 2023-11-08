import React, { useContext, useState, useEffect } from 'react';

import useResumes from './hooks/useResumes';
import { FetchDataContext } from "../routes/routesConfig";
import DocumentList from '../common/DocumentList';
import GenerateResumeModal from './GenerateResumeModal';


export default function ResumeList(): React.JSX.Element { 
  const fetchData = useContext(FetchDataContext);

  const { resumes, resumesLoaded, removeResume, addResume, errors } = useResumes(fetchData);
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