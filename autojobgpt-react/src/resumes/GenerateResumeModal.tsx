import React, {useState} from "react";
import Modal from 'react-bootstrap/Modal';
import Alert from 'react-bootstrap/Alert';

import SelectWithRefresh from "../common/SelectWithRefresh";
import { ResumeUpload } from "./types";
import { Job } from "../jobs/types";
import { ResumeTemplate } from "../templates/types";


export default function GenerateResumeModal({ show, setShow, addResume }: {
  show: boolean,
  setShow: (show: boolean) => void,
  addResume: (resume: ResumeUpload) => void
}): React.JSX.Element {
  const [showErrorAlert, setShowErrorAlert] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleSubmit(e: React.FormEvent<HTMLFormElement>): void {    
    e.preventDefault(); // prevent page from reloading

    const job: number = parseInt((document.getElementById("job") as HTMLSelectElement).value);
    const template: number = parseInt((document.getElementById("template") as HTMLSelectElement).value);
    addResume({
      job: job,
      template: template,
    });

    setShow(false);
  }

  function handleRefreshSuccess(): void {
    setShowErrorAlert(false);
    setErrors({});
  }

  function handleRefreshFail(errors: Record<string, string>): void {
    setShowErrorAlert(true);
    setErrors(errors);
  }

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
            apiPath="jobs/"
            id="job"
            label="Job"
            optionToString={(job) => `${job.title}, ${job.company}`}
            onRefreshSuccess={handleRefreshSuccess}
            onRefreshFail={handleRefreshFail}
          />
          <SelectWithRefresh<ResumeTemplate>
            apiPath="templates/"
            id="template"
            label="Template"
            optionToString={(template) => template.name}
            onRefreshSuccess={handleRefreshSuccess}
            onRefreshFail={handleRefreshFail}
          />
        </Modal.Body>
        <Modal.Footer>
          <Alert
            variant="danger" dismissible className="d-block"
            show={showErrorAlert} onClose={() => setShowErrorAlert(false)}
          >
            {Object.values(errors).join(" ")}
          </Alert>

          <button type="button" className="btn btn-secondary" onClick={() => setShow(false)}>Close</button>
          <button type="submit" className="btn btn-primary">Submit</button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}