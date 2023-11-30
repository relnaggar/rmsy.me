import React, { useContext, useState, useCallback } from 'react';
import Alert from 'react-bootstrap/Alert';

import { ConfirmationModalContext } from "../routes/Layout";
import useResource from '../hooks/useResource';
import useFetch from '../hooks/useFetch';
import DocumentList from '../common/DocumentList';
import EditResumeModal from './EditResumeModal';
import GenerateResumeModal from './GenerateResumeModal';
import { Resume, ResumeUpload, Substitution, getPlaceholderResume } from './types';


export default function ResumeList(): React.JSX.Element {
  const openConfirmationModal = useContext(ConfirmationModalContext);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showErrorAlert, setShowErrorAlert] = useState<boolean>(false);

  const handleErrors = useCallback((errors: Record<string,string>) => {
    setErrors(errors);
    setShowErrorAlert(true);
  }, []);

  const [generateResumeErrors, setGenerateResumeErrors] = useState<Record<string,string>>({});
  const [showGenerateResumeErrorsAlert, setShowGenerateResumeErrorsAlert] = useState<boolean>(false);

  const {
    resource: substitutions,
    setResource: setSubstitutions,
  } = useFetch<Substitution[]>("resumesubstitutions/", { initialResource: [], onFail: handleErrors });

  const handleGenerateResumeSuccess = useCallback((resume: Resume) => {
    setShowGenerateResumeErrorsAlert(false);
    setGenerateResumeErrors({});
    setSubstitutions([...substitutions, ...resume.substitutions]);
  }, [substitutions, setSubstitutions]);
  
  const handleGenerateResumeFail = useCallback((errors: Record<string,string>) => {
    setGenerateResumeErrors(errors);
    setShowGenerateResumeErrorsAlert(true);
    setShowGenerateResume(true);
  }, []);

  const resumeAPIPath: string = "resumes/";
  const {    
    resources: resumes,
    fetching: loadingResumes,
    refetch: refetchResumes,
    posting: addingResume,
    postResource: addResume,
    deleteResource: removeResume,
    idBeingDeleted: resumeBeingRemovedID,    
  } = useResource<Resume,ResumeUpload>(resumeAPIPath, getPlaceholderResume, {
    onFetchFail: handleErrors,
    onPostSuccess: handleGenerateResumeSuccess,
    onPostFail: handleGenerateResumeFail,
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

  function handleSubstitutionSaveSuccess(): void {
    refetchResumes();
  }

  return(
    <section>
      <h2>Resumes</h2>
      <Alert variant="danger" show={showErrorAlert} onClose={() => setShowErrorAlert(false)} dismissible>
        {Object.values(errors).join(" ")}
      </Alert>
      <DocumentList
        documents={resumes}
        loadingDocuments={loadingResumes}
        onClickEditDocument={handleClickEditResume}
        onClickRemoveDocument={handleClickRemoveResume}
        documentBeingRemovedID={resumeBeingRemovedID}
        onClickAddDocument={handleClickAddResume}
        addButtonText="Generate new resume"
        addDisabled={addingResume}
      />
      <EditResumeModal
        apiPath={resumeAPIPath}
        resumes={resumes} setResumes={refetchResumes}
        show={showEditResumeModal} setShow={setShowEditResumeModal}
        resumeID={editResumeID}
        substitutions={substitutions} setSubstitutions={setSubstitutions}
        onSubstitutionSaveSuccess={handleSubstitutionSaveSuccess}
      />
      <GenerateResumeModal
        show={showGenerateResume} setShow={setShowGenerateResume}
        addResume={addResume}
        errors={generateResumeErrors} setErrors={setGenerateResumeErrors}
        showErrorAlert={showGenerateResumeErrorsAlert} setShowErrorAlert={setShowGenerateResumeErrorsAlert}
      />
    </section>
  )
}