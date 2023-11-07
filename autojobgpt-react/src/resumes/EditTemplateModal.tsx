import React from "react";
import Modal from 'react-bootstrap/Modal';


export default function EditTemplateModal({ show, setShow, id }: {
  show: boolean,
  setShow: (show: boolean) => void,
  id: number
}): React.JSX.Element {
  function handleClose() {
    setShow(false);
  }

  function onEntered(): void {
    // document.getElementById("name")?.focus();
  }

  return (
    <Modal show={show} onHide={handleClose} onEntered={onEntered} aria-labelledby="editTemplateModalLabel">
      <Modal.Header closeButton>
        <Modal.Title id="editTemplateModalLabel">Edit Resume Template</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Template id: {id}</p>
      </Modal.Body>
      <Modal.Footer>
        <button type="button" className="btn btn-secondary" onClick={handleClose}>Close</button>
      </Modal.Footer>
    </Modal>
  )
}