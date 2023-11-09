import React from 'react';
import Modal from 'react-bootstrap/Modal';

export default function ConfirmationModal({ show, setShow, action, actionDescription, actionVerb }: {
  show: boolean,
  setShow: (show: boolean) => void,
  action: () => void,
  actionDescription: string
  actionVerb: string
}): React.JSX.Element {
  function handleClose(): void {
    setShow(false);
  }

  function onEntered(): void {
    document.getElementById("confirmationCloseButton")?.focus();
  }

  function handleClickAction(_: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
    action();
    handleClose();
  }

  return (
    <Modal show={show} onHide={handleClose} onEntered={onEntered} aria-labelledby="confirmationModalLabel">
      <Modal.Header closeButton>
        <Modal.Title id="confirmationModalLabel">Confirm {actionVerb}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Are you sure you want to {actionDescription}?</p>
      </Modal.Body>
      <Modal.Footer>
        <button type="button" className="btn btn-danger" onClick={handleClickAction}>{actionVerb}</button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleClose}
          id="confirmationCloseButton"
        >Close</button>
      </Modal.Footer>
    </Modal>
  )
}