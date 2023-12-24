import React, { useCallback, useId } from "react";

import useInputControl from "../hooks/useInputControl";
import useFetchResource from "../hooks/useFetchResource";
import AddModal, { AddResourceModalProps } from "../common/AddModal";
import SelectInputWithRefresh from "../common/SelectInputWithRefresh";
import { Job, ResumeTemplate, ResumeUpload } from '../api/types';


const AddResumeModal = ({  
  postResource: postResume,
  ...addModal
}: AddResourceModalProps<ResumeUpload>): React.JSX.Element => {
  const modalId = useId();
  const jobInput = useInputControl("");
  const templateInput = useInputControl("");

  const handleRefreshSuccess = useCallback(() => {
    addModal.setShowErrorAlert(false);
    addModal.setErrors({});
  }, [addModal]);

  const handleRefreshFail = useCallback((errors: Record<string, string[]>) => {
    addModal.setShowErrorAlert(true);
    addModal.setErrors(errors);
  }, [addModal]);

  const jobManager = useFetchResource<Job>("jobs/", {
    onSuccess: handleRefreshSuccess,
    onFail: handleRefreshFail,
  });

  const templateManager = useFetchResource<ResumeTemplate>("templates/", {
    onSuccess: handleRefreshSuccess,
    onFail: handleRefreshFail,
  });

  const validateSubmit = (): boolean => {
    if (jobInput.value === "" || templateInput.value === "") {
      const newErrors: Record<string, string[]> = {};
      if (jobInput.value === "") {
        newErrors["job"] = ["Please select a job."];
      }
      if (templateInput.value === "") {
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
    <AddModal modalId={modalId} {...addModal}
      title="Generate Resume" validateSubmit={validateSubmit} onValidatedSubmit={handleValidatedSubmit}
    >
      <SelectInputWithRefresh {...jobManager}
        value={jobInput.value} editing={jobInput.editing} handleChange={jobInput.handleChange}
        label="Job" optionToString={(job) => `${job.title}, ${job.company}`} errors={addModal.errors["job"]}
      />
      <SelectInputWithRefresh {...templateManager}
        value={templateInput.value} editing={templateInput.editing} handleChange={templateInput.handleChange}
        label="Template" optionToString={(template) => template.name} errors={addModal.errors["template"]}
      />
    </AddModal>
  );
};

export default AddResumeModal;