import React, { useContext, useState } from 'react';

import { ConfirmationModalContext } from "../routes/Layout";
import useResource from '../hooks/useResource';
import DocumentList from '../common/DocumentList';
import EditResumeModal from './EditResumeModal';
import GenerateResumeModal from './GenerateResumeModal';
import { Resume, ResumeUpload } from './types';


export default function ResumeList(): React.JSX.Element {
  const {
    setShow: setShowConfirmationModal,
    setAction: setConfirmationAction,
    setActionDescription: setConfirmationActionDescription,
    setActionVerb: setConfirmationActionVerb,
  } = useContext(ConfirmationModalContext);

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
  } = useResource<Resume,ResumeUpload>("resumes/", getPlaceholderResume);

  const [showEditResumeModal, setShowEditResumeModal] = useState<boolean>(false);
  const [editResumeID, setEditResumeID] = useState<number>(-1);
  const [showGenerateResume, setShowGenerateResume] = useState<boolean>(false);

  function handleClickEditResume(id: number): (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void {
    return (_: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      setEditResumeID(id);
      setShowEditResumeModal(true);
    }
  }

  function handleClickRemoveResume(id: number): (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void {
    return (_: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      setConfirmationAction(() => () => removeResume(id));
      const resume: Resume = resumes.find((resume) => resume.id === id)!;
      setConfirmationActionDescription(`delete resume "${resume.name}"`);
      setConfirmationActionVerb("Delete");
      setShowConfirmationModal(true);      
    }
  }
  
  function handleClickAddResume(_: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
    setShowGenerateResume(true);
  }  

  return(
    <section>
      <h2>Resumes</h2>
      <DocumentList
        documents={resumes}
        documentsLoaded={resumesLoaded}
        onClickEditDocument={handleClickEditResume}
        onClickRemoveDocument={handleClickRemoveResume}
        onClickAddDocument={handleClickAddResume}
        addButtonText="Generate new resume"
      />
      <EditResumeModal show={showEditResumeModal} setShow={setShowEditResumeModal} id={editResumeID} />
      <GenerateResumeModal show={showGenerateResume} setShow={setShowGenerateResume} addResume={addResume} />
    </section>
  )
}