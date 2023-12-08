import React from "react";
import BootstrapModal from 'react-bootstrap/Modal';

import ErrorAlert from "./ErrorAlert";
import { ModalProps } from "./types";


interface AddModalProps extends ModalProps {
  title: string,
  modalID: string,
  size?: "sm" | "lg" | "xl",
  onClickSubmit?: () => void,
  onSuccessfulSubmit: () => void,
  submitDisabled?: boolean,
  customValidation?: () => boolean,
  children: React.ReactNode,
};

const AddModal = ({
  show, setShow, errors, setErrors, showErrorAlert, setShowErrorAlert,
  title,
  modalID,
  size = undefined,
  onClickSubmit = () => {},
  onSuccessfulSubmit,
  submitDisabled = false,
  customValidation = () => true,
  children,
}: AddModalProps): React.JSX.Element => {
  const handleEntered = (): void => {
    const firstInputElement: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null =
      document.getElementById(modalID)!.querySelector('input, select, textarea');
    firstInputElement?.focus();
  };

  const handleClose = (): void => {
    setShow(false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault(); // prevent page from reloading

    setErrors({});
    setShowErrorAlert(false);
    onClickSubmit?.();

    if (e.currentTarget.reportValidity() && customValidation()) {
      onSuccessfulSubmit();
      setShow(false);
    }
  };

  return (
    <BootstrapModal id={modalID}
      size={size} aria-labelledby={`${modalID}Label`} 
      show={show} onEntered={handleEntered} onHide={handleClose}       
    >
      <BootstrapModal.Header closeButton>
        <BootstrapModal.Title id={`${modalID}Label`}>{title}</BootstrapModal.Title>
      </BootstrapModal.Header>
      <form onSubmit={handleSubmit}>
        <BootstrapModal.Body>
          {children}
        </BootstrapModal.Body>
        <BootstrapModal.Footer>
          <ErrorAlert errors={errors} showErrorAlert={showErrorAlert} setShowErrorAlert={setShowErrorAlert} />
          <button type="button" className="btn btn-secondary" onClick={handleClose}>Close</button>
          <button type="submit" className="btn btn-primary" disabled={submitDisabled} formNoValidate>
            Submit
          </button>
        </BootstrapModal.Footer>
      </form>
    </BootstrapModal>
  );
};

export default AddModal;