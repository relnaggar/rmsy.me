import React from "react";

import { closeModal } from "../common/utilities";
import { ResumeUpload } from "./types";

export default function GenerateResumeModal({ addResume }: {
  addResume: (resume: ResumeUpload) => void
}): React.JSX.Element {

  function handleSubmit(e: React.FormEvent<HTMLFormElement>): void {
    // prevent page from reloading
    e.preventDefault();

    // close modal
    const modal: HTMLElement = document.getElementById("generateResumeModal")!;
    closeModal(modal);

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

  return (
    <div
      className="modal fade"
      id="generateResumeModal"
      tabIndex={-1}
      aria-labelledby="generateResumeModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h1 className="modal-title fs-5" id="generateResumeModalLabel">Generate Resume</h1>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
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
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button type="submit" className="btn btn-primary">Submit</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}