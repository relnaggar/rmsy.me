import React, { useContext } from 'react';

import { ConfirmationModalContext } from "../routes/Layout";
import useAddModal from "../hooks/useAddModal";
import useEditModal from "../hooks/useEditModal";
import useErrorAlert from "../hooks/useErrorAlert";
import useFetchResource from "../hooks/useFetchResource";
import useResource from "../hooks/useResource";
import useFilterResource from "../hooks/useFilterResource";
import useDuplicate from '../hooks/useDuplicate';
import ErrorAlert from '../common/ErrorAlert';
import FilterResourceSelect from '../common/FilterResourceSelect';
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
      id: resumeUpload.job,
      url: "",
      title: "",
      company: "",
      posting: "",
      status: 1,
      chosen_resume: null,
    },
    template: {
      id: resumeUpload.template,
      name: "",
      docx: "",
      png: "",
      fillFields: [],     
      type: "resume"   
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
  const { setResources: setSubstitutions } = substitutionManager;

  const handleAddResumeSuccess = (resume: Resume) => {
    addResumeModal.handleAddSuccess();
    setSubstitutions((substitutions) => [...substitutions, ...resume.substitutions]);
  };

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

  const { filteredResources: filteredResumes, ...filterResumeManager} = useFilterResource<Resume, Job>(resumes, "job");

  const { duplicate } = useDuplicate({
    apiPath: resumeManager.apiPath, setResources: resumeManager.setResources,
    ...errorAlert
  });

  const handleClickDuplicate = (id: number) => (_: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
    const resume: Resume = resumes.find((resume) => resume.id === id)!;
    const resumeUpload: ResumeUpload = {
      job: resume.job!.id,
      template: resume.template!.id,
    };
    duplicate(id, getPlaceholderResume(resumeUpload));
    editResumeModal.close();
  }

  return(
    <section className="mt-3">
      <h2 className="mb-3">Resumes</h2>
      <ErrorAlert {...errorAlert} />
      <FilterResourceSelect {...filterResumeManager}
        filterByOptionToString={(job: Job) => `${job.title}, ${job.company}`}
        filterLabel="Filter by job:" defaultOptionLabel="All Jobs"
      />
      <DocumentList {...{...resumeManager, resources: filteredResumes }}
        onClickEditDocument={handleClickEditResume}
        onClickRemoveDocument={handleClickRemoveResume}
        onClickAddDocument={handleClickAddResume}
        addButtonText="Generate new resume"        
      />
      <EditResumeModal editId={editResumeModal.editId}
        show={editResumeModal.show}
        setShow={editResumeModal.setShow} 
        apiPath={resumeManager.apiPath}
        resources={resumeManager.resources}
        setResources={resumeManager.setResources}        
        substitutions={substitutionManager.resources} setSubstitutions={substitutionManager.setResources}
        onSubstitutionSaveSuccess={handleSubstitutionSaveSuccess}
        onClickDuplicate={handleClickDuplicate}
      />
      <AddResumeModal {...addResumeModal}
        postResource={resumeManager.postResource}
        templateTypeLabel="Resume"
      />
    </section>
  )
};

export default ResumeList;