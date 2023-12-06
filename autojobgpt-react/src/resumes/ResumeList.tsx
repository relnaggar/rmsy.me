import React, { useContext, useState, useCallback } from 'react';
import Alert from 'react-bootstrap/Alert';

import { ConfirmationModalContext } from "../routes/Layout";
import useResource from '../hooks/useResource';
import useFetch from '../hooks/useFetch';
import useFormInput from '../hooks/useFormInput';
import DocumentList from '../common/DocumentList';
import EditResumeModal from './EditResumeModal';
import GenerateResumeModal from './GenerateResumeModal';
import { Resume, ResumeUpload, Substitution, getPlaceholderResume } from './types';
import { Job } from '../jobs/types';


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
  } = useFetch<Substitution[]>("substitutions/", { initialResource: [], onFail: handleErrors });

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
    setResources: setResumes,
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

  const jobInput = useFormInput("0");
  const jobIDsWithAtLeastOneResume: number[] = [];
  const jobsWithAtLeastOneResume: Job[] = [];
  resumes.forEach((resume) => {
    if (resume.id !== -1 && !jobIDsWithAtLeastOneResume.includes(resume.job.id)) {
      jobIDsWithAtLeastOneResume.push(resume.job.id);
      
      let i: number = 0;
      while (i < jobsWithAtLeastOneResume.length && jobsWithAtLeastOneResume[i].id < resume.job.id) {
        i++;
      }
      jobsWithAtLeastOneResume.splice(i, 0, resume.job);      
    }
  });

  const sortedResumes: Resume[] = resumes.sort((a, b) => a.id - b.id);

  return(
    <section className="mt-3">
      <h2>Resumes</h2>
      { jobsWithAtLeastOneResume.length > 1 &&
        <div className="mb-3 row">
          <label htmlFor="resume-job-select" className="col-auto col-form-label me-3">Filter by job:</label>
          <div className="col-auto">
            <select
              id="resume-job-select" className="form-select"
              value={jobInput.value} onChange={jobInput.handleChange}
            >
              <option value="0">All Jobs</option>
              {jobsWithAtLeastOneResume.map((job) => (
                <option key={job.id} value={job.id}>{`${job.title}, ${job.company}`}</option>
              ))}
            </select>
          </div>
        </div>
      }
      <Alert variant="danger" show={showErrorAlert} onClose={() => setShowErrorAlert(false)} dismissible>
        {Object.values(errors).join(" ")}
      </Alert>
      <DocumentList
        documents={
          jobInput.value === "0" ?
            sortedResumes
          :
            sortedResumes.filter((resume) => resume.job.id === parseInt(jobInput.value))
        }
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
        resumes={resumes} setResumes={setResumes}
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