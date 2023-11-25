import React, { useContext, useState } from 'react';
import Alert from 'react-bootstrap/Alert';

import { ConfirmationModalContext } from "../routes/Layout";
import useResource from '../hooks/useResource';
import DocumentList from '../common/DocumentList';
import EditResumeModal from './EditResumeModal';
import GenerateResumeModal from './GenerateResumeModal';
import { Resume, ResumeUpload } from './types';


export default function ResumeList(): React.JSX.Element {
  const openConfirmationModal = useContext(ConfirmationModalContext);

  const [errorMessage, setErrorMessage] = useState<string>("");
  const [showErrorAlert, setShowErrorAlert] = useState<boolean>(false);

  function handleErrors(errors: Record<string,string>): void {
    setErrorMessage(Object.values(errors).join(" "));
    setShowErrorAlert(true);    
  }

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
    fetching: loadingResumes,
    deleteResource: removeResume,
    idBeingDeleted: resumeBeingRemovedID,
    postResource: addResume,
  } = useResource<Resume,ResumeUpload>("resumes/", getPlaceholderResume, {
    onFetchFail: handleErrors,
    onDeleteFail: handleErrors,  
  });

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
      const resume: Resume = resumes.find((resume) => resume.id === id)!;
      openConfirmationModal(() => removeResume(id), `delete resume "${resume.name}"`, "Delete");
    }
  }
  
  function handleClickAddResume(_: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
    setShowGenerateResume(true);
  }  

  return(
    <section>
      <h2>Resumes</h2>
      <Alert variant="danger" show={showErrorAlert} onClose={() => setShowErrorAlert(false)} dismissible>
        {errorMessage}
      </Alert>
      <DocumentList
        documents={resumes}
        loadingDocuments={loadingResumes}
        onClickEditDocument={handleClickEditResume}
        onClickRemoveDocument={handleClickRemoveResume}
        documentBeingRemovedID={resumeBeingRemovedID}
        onClickAddDocument={handleClickAddResume}
        addButtonText="Generate new resume"
      />
      <EditResumeModal show={showEditResumeModal} setShow={setShowEditResumeModal} id={editResumeID} />
      <GenerateResumeModal show={showGenerateResume} setShow={setShowGenerateResume} addResume={addResume} />
    </section>
  )
}