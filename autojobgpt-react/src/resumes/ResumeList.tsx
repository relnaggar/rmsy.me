import React, { useContext, useState, useCallback } from 'react';

import { ConfirmationModalContext } from "../routes/Layout";
import useResource from '../hooks/useResource';
import useFetchResource from '../hooks/useFetchResource';
import useFormInput from '../hooks/useInputControl';
import useAddModal from '../hooks/useAddModal';
import ErrorAlert from '../common/ErrorAlert';
import DocumentList from '../common/DocumentList';
import EditResumeModal from './EditResumeModal';
import AddResumeModal from './AddResumeModal';
import { Job, Substitution, Resume, ResumeUpload } from '../api/types';
import useErrorAlert from '../hooks/useErrorAlert';


export const getPlaceholderResume = (resumeUpload: ResumeUpload): Resume => {
  return {
    id: -1,
    substitutions: [],
    version: -1,
    docx: "",
    png: "",
    chat_messages: [],
    job: {
      "id": resumeUpload.job,
      "url": "",
      "title": "",
      "company": "",
      "posting": "",
      "status": 1
    },
    template: {
      "id": resumeUpload.template,
      "name": "",
      "docx": "",
      "png": "",
      "fillFields": [],        
    },
    name: "",
  }
};

const ResumeList = (): React.JSX.Element => {
  const openConfirmationModal = useContext(ConfirmationModalContext);
  const addResumeModal = useAddModal();
  const errorAlert = useErrorAlert();

  const substitutions = useFetchResource<Substitution>("substitutions/", {
    onFail: errorAlert.showErrors
  });

  const handleAddResumeSuccess = useCallback((resume: Resume) => {
    addResumeModal.handleAddSuccess();
    substitutions.setResources([...substitutions.resources, ...resume.substitutions]);
  }, [addResumeModal, substitutions]);

  const resumes = useResource<Resume,ResumeUpload>("resumes/", getPlaceholderResume, {
    onFetchFail: errorAlert.showErrors,
    onPostSuccess: handleAddResumeSuccess,
    onPostFail: addResumeModal.handleAddFail,
    onDeleteFail: errorAlert.showErrors,
  });

  const [showEditResumeModal, setShowEditResumeModal] = useState<boolean>(false);
  const [editResumeId, setEditResumeId] = useState<number>(-1);
  
  const handleClickEditResume = (id: number) => (_: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
    setEditResumeId(id);
    setShowEditResumeModal(true);
  };

  const handleClickRemoveResume = (id: number) => (_: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
    const resume: Resume = resumes.resources.find((resume) => resume.id === id)!;
    openConfirmationModal(() => resumes.deleteResource(id), `delete resume "${resume.name}"`, "Delete");
  };

  const handleSubstitutionSaveSuccess = (): void => {
    resumes.refetch();
  };

  const jobInput = useFormInput("0");
  const jobIdsWithAtLeastOneResume: number[] = [];
  const jobsWithAtLeastOneResume: Job[] = [];
  resumes.resources.forEach((resume) => {
    if (resume.id !== -1 && !jobIdsWithAtLeastOneResume.includes(resume.job.id)) {
      jobIdsWithAtLeastOneResume.push(resume.job.id);
      
      let i: number = 0;
      while (i < jobsWithAtLeastOneResume.length && jobsWithAtLeastOneResume[i].id < resume.job.id) {
        i++;
      }
      jobsWithAtLeastOneResume.splice(i, 0, resume.job);      
    }
  });

  const sortedResumes: Resume[] = resumes.resources.sort((a, b) => a.id - b.id);

  return(
    <section className="mt-3">
      <h2>Resumes</h2>
      { jobsWithAtLeastOneResume.length > 1 &&
        <div className="mb-3 row">
          <label htmlFor="resume-job-select" className="col-auto col-form-label me-3">Filter by job:</label>
          <div className="col-auto">
            <select
              id="resume-job-select" className="form-select"
              value={jobInput.value} onChange={jobInput.handleChange as (e: React.ChangeEvent<HTMLSelectElement>) => void}
            >
              <option value="0">All Jobs</option>
              {jobsWithAtLeastOneResume.map((job) => (
                <option key={job.id} value={job.id}>{`${job.title}, ${job.company}`}</option>
              ))}
            </select>
          </div>
        </div>
      }
      <ErrorAlert {...errorAlert} />
      <DocumentList
        documents={
          jobInput.value === "0" ?
            sortedResumes
          :
            sortedResumes.filter((resume) => resume.job.id === parseInt(jobInput.value))
        }
        loadingDocuments={resumes.fetching}
        onClickEditDocument={handleClickEditResume}
        onClickRemoveDocument={handleClickRemoveResume}
        documentBeingRemovedId={resumes.idBeingDeleted}
        onClickAddDocument={addResumeModal.open}
        addButtonText="Generate new resume"
        addDisabled={resumes.posting}
      />
      <EditResumeModal
        apiPath={resumes.apiPath}
        resumes={resumes.resources} setResumes={resumes.setResources}
        show={showEditResumeModal} setShow={setShowEditResumeModal}
        resumeId={editResumeId}
        substitutions={substitutions.resources} setSubstitutions={substitutions.setResources}
        onSubstitutionSaveSuccess={handleSubstitutionSaveSuccess}
      />
      <AddResumeModal {...addResumeModal} addResume={resumes.postResource} />
    </section>
  )
};

export default ResumeList;