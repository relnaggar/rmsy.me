import React, { useContext, useCallback } from 'react';

import { ConfirmationModalContext } from "../routes/Layout";
import useAddModal from "../hooks/useAddModal";
import useEditModal from "../hooks/useEditModal";
import useErrorAlert from "../hooks/useErrorAlert";
import useFetchResource from "../hooks/useFetchResource";
import useResource from "../hooks/useResource";
import useFormInput from '../hooks/useInputControl';
import ErrorAlert from '../common/ErrorAlert';
import DocumentList from '../common/DocumentList';
import EditResumeModal from './EditResumeModal';
import AddResumeModal from './AddResumeModal';
import { Job, Substitution, Resume, ResumeUpload } from '../api/types';


const getPlaceholderResume = (resumeUpload: ResumeUpload): Resume => {
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
  const editResumeModal = useEditModal();
  const errorAlert = useErrorAlert();

  const substitutionManager = useFetchResource<Substitution>("substitutions/", {
    onFail: errorAlert.showErrors
  });
  const { resources: substitutions, setResources: setSubstitutions } = substitutionManager;

  const handleAddResumeSuccess = useCallback((resume: Resume) => {
    addResumeModal.handleAddSuccess();
    setSubstitutions([...substitutions, ...resume.substitutions]);
  }, [addResumeModal, substitutions, setSubstitutions]);

  const resumeManager = useResource<Resume,ResumeUpload>("resumes/", getPlaceholderResume, {
    onFetchFail: errorAlert.showErrors,
    onPostSuccess: handleAddResumeSuccess,
    onPostFail: addResumeModal.handleAddFail,
    onDeleteFail: errorAlert.showErrors,
  });
  const { resources: resumes, deleteResource: deleteResume, refetch: refetchResumes } = resumeManager;
  
  const handleClickEditResume = (id: number) => (_: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
    editResumeModal.open(id);
  };

  const handleClickRemoveResume = (id: number) => (_: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
    const resume: Resume = resumes.find((resume) => resume.id === id)!;
    openConfirmationModal(() => deleteResume(id), `delete resume "${resume.name}"`, "Delete");
  };

  const handleClickAddResume = (_: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
    addResumeModal.open();
  }

  const handleSubstitutionSaveSuccess = (): void => {
    refetchResumes();
  };

  const jobInput = useFormInput("0");
  const jobIdsWithAtLeastOneResume: number[] = [];
  const jobsWithAtLeastOneResume: Job[] = [];
  resumes.forEach((resume) => {
    if (resume.id !== -1 && !jobIdsWithAtLeastOneResume.includes(resume.job.id)) {
      jobIdsWithAtLeastOneResume.push(resume.job.id);
      
      let i: number = 0;
      while (i < jobsWithAtLeastOneResume.length && jobsWithAtLeastOneResume[i].id < resume.job.id) {
        i++;
      }
      jobsWithAtLeastOneResume.splice(i, 0, resume.job);      
    }
  });

  let filteredResumes: Resume[]
  if (jobInput.value === "0") {
    filteredResumes = resumes;
  } else {
    filteredResumes = resumes.filter((resume) => resume.job.id === parseInt(jobInput.value))
  }

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
        onClickEditDocument={handleClickEditResume}
        onClickRemoveDocument={handleClickRemoveResume}
        onClickAddDocument={handleClickAddResume}
        addButtonText="Generate new resume"
        {...{...resumeManager, resources: filteredResumes}}
      />
      <EditResumeModal
        apiPath={resumeManager.apiPath}
        resumes={resumeManager.resources} setResumes={resumeManager.setResources}
        show={editResumeModal.show} setShow={editResumeModal.setShow}
        resumeId={editResumeModal.editId}
        substitutions={substitutionManager.resources} setSubstitutions={substitutionManager.setResources}
        onSubstitutionSaveSuccess={handleSubstitutionSaveSuccess}
      />
      <AddResumeModal postResource={resumeManager.postResource} {...addResumeModal} />
    </section>
  )
};

export default ResumeList;