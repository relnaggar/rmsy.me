import React from "react";

import { closeModal } from "../common/utilities";
import { ResumeTemplateUpload } from "./types";


export default function AddTemplateModal({ addTemplate }: {
  addTemplate: (template: ResumeTemplateUpload) => void
}): React.JSX.Element {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>): void {
    // prevent page from reloading
    e.preventDefault();

    // close modal
    const modal: HTMLElement = document.getElementById("addTemplateModal")!;
    closeModal(modal);
    
    // add template
    const name: string = (document.getElementById("name") as HTMLInputElement).value;
    const docx: File = (document.getElementById("upload") as HTMLInputElement).files![0];
    const description: string = (document.getElementById("description") as HTMLInputElement).value;
    const templateUpload: ResumeTemplateUpload = { name, docx, description };
    addTemplate(templateUpload);

    // reset form
    e.currentTarget.reset();
  }

  return (
    <div
      className="modal fade"
      id="addTemplateModal"
      tabIndex={-1}
      aria-labelledby="addTemplateModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h1 className="modal-title fs-5" id="addTemplateModalLabel">Add Resume Template</h1>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="mb-3">
                <label htmlFor="name" className="form-label">Template Name</label>
                <input type="text" className="form-control" id="name" name="name" required />
              </div>
              <div className="mb-3">
                <label htmlFor="upload" className="form-label">Upload</label>
                <input type="file" className="form-control" id="upload" name="upload" required
                  accept=".doc,.docx,.xml,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="description" className="form-label">Description (optional)</label>
                <textarea className="form-control" id="description" name="description" rows={3}></textarea>
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
  )
}