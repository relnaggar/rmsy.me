import React from 'react';
import Modal from 'react-bootstrap/Modal';

export default function ConfirmationModal({ show, setShow, action, actionDescription, actionVerb }: {
  show: boolean,
  setShow: (show: boolean) => void,
  action: () => void,
  actionDescription: string
  actionVerb: string
}): React.JSX.Element {
  function handleClickAction(_: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
    action();
    setShow(false);
  }

  return (
    <Modal
      show={show} onHide={() => setShow(false)}
      onEntered={() => document.getElementById("confirmationCloseButton")?.focus()}
      aria-labelledby="confirmationModalLabel"
    >
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
          onClick={() => setShow(false)}
          id="confirmationCloseButton"
        >Close</button>
      </Modal.Footer>
    </Modal>
  )
}