import React from "react";
import Modal from 'react-bootstrap/Modal';

import { JobUpload } from "./types";


export default function AddJobModal({ show, setShow, addJob }: {
  show: boolean,
  setShow: (show: boolean) => void,
  addJob: (jobUpload: JobUpload) => void,
}): React.JSX.Element {
  function handleClose() {
    setShow(false);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>): void {
    // prevent page from reloading
    e.preventDefault();

    // close modal
    handleClose();

    // add job    
    const url: string = (document.getElementById("url") as HTMLInputElement).value;
    addJob({url});

    // reset form
    e.currentTarget.reset();   
  }

  function onEntered(): void {
    document.getElementById("url")?.focus();
  }

  return (
    <Modal show={show} onHide={handleClose} onEntered={onEntered} aria-labelledby="addJobModalLabel">
      <Modal.Header closeButton>
        <Modal.Title id="addJobModalLabel">Add Job</Modal.Title>
      </Modal.Header>
      <form onSubmit={handleSubmit}>
        <Modal.Body>
          <div className="mb-3">
            <label htmlFor="url" className="form-label">URL</label>
            <input type="url" className="form-control" id="url" name="url" required />
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