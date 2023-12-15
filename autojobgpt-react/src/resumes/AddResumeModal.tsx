import React, { useCallback } from "react";

import useInputControl from "../hooks/useInputControl";
import useFetchResource from "../hooks/useFetchResource";
import { UsePostResource } from "../hooks/usePostResource";
import AddModal, { AddModalMixin } from "../common/AddModal";
import SelectInputWithRefresh from "../common/SelectInputWithRefresh";
import { Job, ResumeTemplate, ResumeUpload } from '../api/types';


interface AddResumeModalProps extends Pick<UsePostResource<ResumeUpload>, "postResource">, AddModalMixin {};

const AddResumeModal = ({  
  postResource: postResume,
  ...addModal
}: AddResumeModalProps): React.JSX.Element => {
  const modalId = "addResumeModal";
  const jobInput = useInputControl("0");
  const templateInput = useInputControl("0");

  const handleRefreshSuccess = useCallback(() => {
    addModal.setShowErrorAlert(false);
    addModal.setErrors({});
  }, [addModal]);

  const handleRefreshFail = useCallback((errors: Record<string, string[]>) => {
    addModal.setShowErrorAlert(true);
    addModal.setErrors(errors);
  }, [addModal]);

  const {
    resources: jobs, fetching: fetchingJobs, refetch: refetchJobs, cancel: cancelJobs
  } = useFetchResource<Job>("jobs/", {
    onSuccess: handleRefreshSuccess,
    onFail: handleRefreshFail,
  });

  const {
    resources: templates, fetching: fetchingTemplates, refetch: refetchTemplates, cancel: cancelTemplates
  } = useFetchResource<ResumeTemplate>("templates/", {
    onSuccess: handleRefreshSuccess,
    onFail: handleRefreshFail,
  });

  const validateSubmit = (): boolean => {
    const jobValue: number = parseInt(jobInput.value);
    const templateValue: number = parseInt(templateInput.value);

    if (jobValue === 0 || templateValue === 0) {
      const newErrors: Record<string, string[]> = {};
      if (jobValue === 0) {
        newErrors["job"] = ["Please select a job."];
      }
      if (templateValue === 0) {
        newErrors["template"] = ["Please select a template."];
      }
      addModal.setErrors(newErrors);
      jobInput.stopEditing();
      templateInput.stopEditing();
      return false;
    } else {
      return true;
    }
  }

  const handleValidatedSubmit = (): void => {
    postResume({
      job: parseInt(jobInput.value),
      template: parseInt(templateInput.value),
    });
    jobInput.stopEditing();
    templateInput.stopEditing();
  };

  return (
    <AddModal {...addModal} title="Generate Resume" modalId="addResumeModal" validateSubmit={validateSubmit} onValidatedSubmit={handleValidatedSubmit}>
      <SelectInputWithRefresh<Job>
        id={`${modalId}Job`}
        label="Job"
        optionToString={(job) => `${job.title}, ${job.company}`}
        value={jobInput.value}
        handleChange={jobInput.handleChange as (e: React.ChangeEvent<HTMLSelectElement>) => void}
        editing={jobInput.editing}
        options={jobs}
        refreshing={fetchingJobs}
        refresh={refetchJobs}
        errors={addModal.errors["job"]}
        cancel={cancelJobs}
      />
      <SelectInputWithRefresh<ResumeTemplate>
        id={`${modalId}Template`}
        label="Template"
        optionToString={(template) => template.name}
        value={templateInput.value}
        handleChange={templateInput.handleChange as (e: React.ChangeEvent<HTMLSelectElement>) => void}
        editing={templateInput.editing}
        options={templates}
        refreshing={fetchingTemplates}
        refresh={refetchTemplates}
        errors={addModal.errors["template"]}
        cancel={cancelTemplates}
      />
    </AddModal>
  );
};

export default AddResumeModal;