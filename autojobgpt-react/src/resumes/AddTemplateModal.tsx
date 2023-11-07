import React from "react";
import Modal from 'react-bootstrap/Modal';

import { ResumeTemplateUpload } from "./types";


export default function AddTemplateModal({ show, setShow, onSubmitAddTemplate }: {
  show: boolean,
  setShow: (show: boolean) => void,
  onSubmitAddTemplate: (template: ResumeTemplateUpload) => void
}): React.JSX.Element {
  function handleClose() {
    setShow(false);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>): void {
    // prevent page from reloading
    e.preventDefault();

    // close modal
    handleClose();
    
    // add template
    const name: string = (document.getElementById("name") as HTMLInputElement).value;
    const docx: File = (document.getElementById("upload") as HTMLInputElement).files![0];
    const description: string = (document.getElementById("description") as HTMLInputElement).value;
    const templateUpload: ResumeTemplateUpload = { name, docx, description };
    onSubmitAddTemplate(templateUpload);

    // reset form
    e.currentTarget.reset();
  }

  function onEntered(): void {
    document.getElementById("name")?.focus();
  }

  return (
    <Modal show={show} onHide={handleClose} onEntered={onEntered} aria-labelledby="addTemplateModalLabel">
      <Modal.Header closeButton>
        <Modal.Title id="addTemplateModalLabel">Add Resume Template</Modal.Title>
      </Modal.Header>
      <form onSubmit={handleSubmit}>
        <Modal.Body>
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
        </Modal.Body>
        <Modal.Footer>
          <button type="button" className="btn btn-secondary" onClick={handleClose}>Close</button>
          <button type="submit" className="btn btn-primary">Submit</button>
        </Modal.Footer>
      </form>
    </Modal>
  )
}