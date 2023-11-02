import React from "react";
import Modal from 'react-bootstrap/Modal';

import { ResumeUpload } from "./types";


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
    const job: number = (document.getElementById("job") as HTMLInputElement).valueAsNumber;
    const template: number = (document.getElementById("template") as HTMLInputElement).valueAsNumber;
    addResume({
      job: job,
      template: template
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
            <select className="form-select" id="job" name="job" defaultValue="0" required>
              <option value="0">Open this select menu</option>
              <option value="1">One</option>
              <option value="2">Two</option>
              <option value="3">Three</option>
            </select>
          </div>
          <div className="mb-3">
            <label htmlFor="template" className="form-label">Template</label>
            <select className="form-select" id="template" name="template" defaultValue="0" required>
              <option value="0">Open this select menu</option>
              <option value="1">One</option>
              <option value="2">Two</option>
              <option value="3">Three</option>
            </select>
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