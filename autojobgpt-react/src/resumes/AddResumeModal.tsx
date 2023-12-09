import React, { useCallback } from "react";

import useInputControl from "../hooks/useInputControl";
import useFetch from "../hooks/useFetch";
import AddModal from "../common/AddModal";
import SelectInputWithRefresh from "../common/SelectInputWithRefresh";
import { ResumeUpload } from "./types";
import { Job } from "../jobs/types";
import { ResumeTemplate } from "../templates/types";
import { ModalProps } from "../common/types";


interface AddResumeModalProps extends ModalProps {
  addResume: (resumeUpload: ResumeUpload) => void,  
}

const AddResumeModal = ({
  show, setShow, errors, setErrors, showErrorAlert, setShowErrorAlert,
  addResume,
}: AddResumeModalProps): React.JSX.Element => {
  const modalID = "addResumeModal";
  const jobInput = useInputControl("0");
  const templateInput = useInputControl("0");

  const handleRefreshSuccess = useCallback(() => {
    setShowErrorAlert(false);
    setErrors({});
  }, [setShowErrorAlert, setErrors]);

  const handleRefreshFail = useCallback((errors: Record<string, string[]>) => {
    setShowErrorAlert(true);
    setErrors(errors);
  }, [setShowErrorAlert, setErrors]);

  const { resource: jobs, fetching: loadingJobs, refetch: refetchJobs } = useFetch<Job[]>(
    "jobs/", {
      initialResource: [],
      onSuccess: handleRefreshSuccess,
      onFail: handleRefreshFail,
    }
  );

  const { resource: templates, fetching: loadingTemplates, refetch: refetchTemplates} = useFetch<ResumeTemplate[]>(
    "templates/", {
      initialResource: [],
      onSuccess: handleRefreshSuccess,
      onFail: handleRefreshFail,
    }
  );

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
      setErrors(newErrors);
      jobInput.stopEditing();
      templateInput.stopEditing();
      return false;
    } else {
      return true;
    }
  }

  const handleSuccessfulSubmit = (): void => {
    addResume({
      job: parseInt(jobInput.value),
      template: parseInt(templateInput.value),
    });
    jobInput.stopEditing();
    templateInput.stopEditing();
  };

  return (
    <AddModal
      show={show} setShow={setShow} errors={errors} setErrors={setErrors}
      showErrorAlert={showErrorAlert} setShowErrorAlert={setShowErrorAlert}
      title="Generate Resume" modalID="addResumeModal"
      validateSubmit={validateSubmit} onSuccessfulSubmit={handleSuccessfulSubmit}
    >
      <SelectInputWithRefresh<Job>
        id={`${modalID}Job`}
        label="Job"
        optionToString={(job) => `${job.title}, ${job.company}`}
        value={jobInput.value}
        handleChange={jobInput.handleChange as (e: React.ChangeEvent<HTMLSelectElement>) => void}
        editing={jobInput.editing}
        options={jobs}
        loading={loadingJobs}
        refetch={refetchJobs}
        errors={errors["job"]}
      />
      <SelectInputWithRefresh<ResumeTemplate>
        id={`${modalID}Template`}
        label="Template"
        optionToString={(template) => template.name}
        value={templateInput.value}
        handleChange={templateInput.handleChange as (e: React.ChangeEvent<HTMLSelectElement>) => void}
        editing={templateInput.editing}
        options={templates}
        loading={loadingTemplates}
        refetch={refetchTemplates}
        errors={errors["template"]}
      />
    </AddModal>
  );
};

export default AddResumeModal;