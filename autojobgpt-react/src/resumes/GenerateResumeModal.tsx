import React from "react";
import Modal from 'react-bootstrap/Modal';

import SelectWithRefresh from "../common/SelectWithRefresh";
import { ResumeUpload } from "./types";
import { Job } from "../jobs/types";
import { ResumeTemplate } from "../resumes/types";


export default function GenerateResumeModal({ show, setShow, addResume }: {
  show: boolean,
  setShow: (show: boolean) => void,
  addResume: (resume: ResumeUpload) => void
}): React.JSX.Element {
  function handleClose() {
    setShow(false);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>): void {
    // prevent page from reloading
    e.preventDefault();

    // close modal
    handleClose();

    // add resume
    const job: number = parseInt((document.getElementById("job") as HTMLSelectElement).value);
    const template: number = parseInt((document.getElementById("template") as HTMLSelectElement).value);
    addResume({
      job: job,
      template: template,
    });

    // reset form
    e.currentTarget.reset();
  }

  function onEntered(): void {
    document.getElementById("job")?.focus();
  }

  return (
    <Modal show={show} onHide={handleClose} onEntered={onEntered} aria-labelledby="generateResumeModalLabel">
      <Modal.Header closeButton>
        <Modal.Title id="generateResumeModalLabel">Generate Resume</Modal.Title>
      </Modal.Header>        
      <form onSubmit={handleSubmit}>
        <Modal.Body>
          <div className="mb-3">
            <label htmlFor="job" className="form-label">Job</label>
            <SelectWithRefresh<Job>
              apiPath="../api/jobs/"
              id="job"
              optionToString={(job) => `${job.title}, ${job.company}`}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="template" className="form-label">Template</label>
            <SelectWithRefresh<ResumeTemplate>
              apiPath="../api/templates/"
              id="template"
              optionToString={(template) => template.name}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button type="button" className="btn btn-secondary" onClick={handleClose}>Close</button>
          <button type="submit" className="btn btn-primary">Submit</button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}