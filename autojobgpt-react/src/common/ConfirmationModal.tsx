import React, { useId } from 'react';
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
  const labelId = useId();
  const buttonId = useId();

  const handleClose = (): void => {
    setShow(false);
  }

  const handleEntered = (): void => {
    document.getElementById(buttonId)?.focus();
  };

  const handleClickAction = (_: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
    action();
    setShow(false);
  };

  return (
    <BoostrapModal show={show} onHide={handleClose} onEntered={handleEntered} aria-labelledby={labelId}>
      <BoostrapModal.Header closeButton>
        <BoostrapModal.Title id={labelId}>Confirm {actionVerb}</BoostrapModal.Title>
      </BoostrapModal.Header>
      <BoostrapModal.Body>
        <p>Are you sure you want to {actionDescription}?</p>
      </BoostrapModal.Body>
      <BoostrapModal.Footer>
        <button type="button" className="btn btn-danger" onClick={handleClickAction}>{actionVerb}</button>
        <button id={buttonId} type="button" className="btn btn-secondary" onClick={handleClose}>
          Close
        </button>
      </BoostrapModal.Footer>
    </BoostrapModal>
  )
};

export default ConfirmationModal;