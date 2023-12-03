import React, { useCallback } from "react";
import Modal from 'react-bootstrap/Modal';
import Alert from 'react-bootstrap/Alert';

import SelectWithRefresh from "../common/SelectWithRefresh";
import useFormInput from "../hooks/useFormInput";
import useFetch from "../hooks/useFetch";
import { ResumeUpload } from "./types";
import { Job } from "../jobs/types";
import { ResumeTemplate } from "../templates/types";


export default function GenerateResumeModal({
  show, setShow,
  addResume,
  errors, setErrors,
  showErrorAlert, setShowErrorAlert
}: {
  show: boolean,
  setShow: React.Dispatch<React.SetStateAction<boolean>>,
  addResume: (resume: ResumeUpload) => void,
  errors: Record<string, string>,
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>,
  showErrorAlert: boolean,
  setShowErrorAlert: React.Dispatch<React.SetStateAction<boolean>>,
}): React.JSX.Element {
  const jobInput = useFormInput();
  const templateInput = useFormInput();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>): void {    
    e.preventDefault(); // prevent page from reloading

    const job: number = parseInt((document.getElementById("generate-resume-modal-job") as HTMLSelectElement).value);
    const template: number = parseInt((document.getElementById("generate-resume-modal-template") as HTMLSelectElement).value);

    jobInput.stopEditing();
    templateInput.stopEditing();

    if (job === 0 || template === 0) {
      const newErrors: Record<string, string> = {};
      if (job === 0) {
        newErrors["job"] = "Please select a job.";
      }
      if (template === 0) {
        newErrors["template"] = "Please select a template.";
      }
      setErrors(newErrors);
      setShowErrorAlert(true);
      return;
    }

    addResume({
      job: job,
      template: template,
    });

    setShow(false);
  }

  const handleRefreshSuccess = useCallback(() => {
    setShowErrorAlert(false);
    setErrors({});
  }, [setShowErrorAlert, setErrors]);

  const handleRefreshFail = useCallback((errors: Record<string, string>) => {
    setShowErrorAlert(true);
    setErrors(errors);
  }, [setShowErrorAlert, setErrors]);

  const { resource: jobs, fetching: loadingJobs, refetch: refetchJobs } = useFetch<Job[]>("jobs/", {
    initialResource: [],
    onSuccess: handleRefreshSuccess,
    onFail: handleRefreshFail,
  });

  const {
    resource: templates,
    fetching: loadingTemplates,
    refetch: refetchTemplates
  } = useFetch<ResumeTemplate[]>("templates/", {
    initialResource: [],
    onSuccess: handleRefreshSuccess,
    onFail: handleRefreshFail,
  });

  return (
    <Modal
      show={show} onHide={() => setShow(false)} aria-labelledby="generateResumeModalLabel"
      onEntered={() => document.getElementsByTagName("select")[0]?.focus()} 
    >
      <Modal.Header closeButton>
        <Modal.Title id="generateResumeModalLabel">Generate Resume</Modal.Title>
      </Modal.Header>        
      <form onSubmit={handleSubmit}>
        <Modal.Body>
          <SelectWithRefresh<Job>
            id="generate-resume-modal-job"
            label="Job"
            optionToString={(job) => `${job.title}, ${job.company}`}
            value={jobInput.value}
            onChange={jobInput.handleChange}
            editing={jobInput.editing}
            options={jobs}
            loading={loadingJobs}
            refetch={refetchJobs}
            error={errors["job"]}
          />
          <SelectWithRefresh<ResumeTemplate>
            id="generate-resume-modal-template"
            label="Template"
            optionToString={(template) => template.name}
            value={templateInput.value}
            onChange={templateInput.handleChange}
            editing={templateInput.editing}
            options={templates}
            loading={loadingTemplates}
            refetch={refetchTemplates}
            error={errors["template"]}
          />
        </Modal.Body>
        <Modal.Footer>
          <Alert
            variant="danger" dismissible className="w-100"
            show={showErrorAlert} onClose={() => setShowErrorAlert(false)}
          >            
            { Object.keys(errors).length > 0 &&
              <ul>
                {Object.entries(errors).map(([key, value]) => (
                  <li key={key}>{value}</li>
                ))}
              </ul>
            }
          </Alert>

          <button type="button" className="btn btn-secondary" onClick={() => setShow(false)}>Close</button>
          <button type="submit" className="btn btn-primary">Submit</button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}