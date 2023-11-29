import React from "react";
import Modal from 'react-bootstrap/Modal';


export default function EditResumeModal({ show, setShow, id }: {
  show: boolean,
  setShow: React.Dispatch<React.SetStateAction<boolean>>,
  id: number
}): React.JSX.Element {
  function handleClose() {
    setShow(false);
  }

  function onEntered(): void {
    document.getElementById("name")?.focus();
  }

  return (
    <Modal show={show} onHide={handleClose} onEntered={onEntered} aria-labelledby="editResumeModalLabel">
      <Modal.Header closeButton>
        <Modal.Title id="editResumeModalLabel">Edit Resume</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Resume id: {id}</p>
      </Modal.Body>
      <Modal.Footer>
        <button type="button" className="btn btn-secondary" onClick={handleClose}>Close</button>
      </Modal.Footer>
    </Modal>
  )
}