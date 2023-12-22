import React from 'react';
import BoostrapModal from 'react-bootstrap/Modal';

import { CommonModalProps } from './InputModal';


interface ConfirmationModalProps extends CommonModalProps {
  action: () => void,
  actionDescription: string
  actionVerb: string
};

const ConfirmationModal = ({
  show, setShow,
  action,
  actionDescription,
  actionVerb
}: ConfirmationModalProps): React.JSX.Element => {

  const handleClose = (): void => {
    setShow(false);
  }

  const handleEntered = (): void => {
    document.getElementById("confirmationCloseButton")?.focus();
  };

  const handleClickAction = (_: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
    action();
    setShow(false);
  };

  return (
    <BoostrapModal show={show} onHide={handleClose} onEntered={handleEntered} aria-labelledby="confirmationModalLabel">
      <BoostrapModal.Header closeButton>
        <BoostrapModal.Title id="confirmationModalLabel">Confirm {actionVerb}</BoostrapModal.Title>
      </BoostrapModal.Header>
      <BoostrapModal.Body>
        <p>Are you sure you want to {actionDescription}?</p>
      </BoostrapModal.Body>
      <BoostrapModal.Footer>
        <button type="button" className="btn btn-danger" onClick={handleClickAction}>{actionVerb}</button>
        <button id="confirmationCloseButton" type="button" className="btn btn-secondary" onClick={handleClose}>
          Close
        </button>
      </BoostrapModal.Footer>
    </BoostrapModal>
  )
};

export default ConfirmationModal;