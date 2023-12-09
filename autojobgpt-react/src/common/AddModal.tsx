import React from "react";
import BootstrapModal from 'react-bootstrap/Modal';

import ErrorAlert from "./ErrorAlert";


export interface ModalProps {
  show: boolean,
  setShow: React.Dispatch<React.SetStateAction<boolean>>,
  errors: Record<string,string[]>,
  setErrors: React.Dispatch<React.SetStateAction<Record<string,string[]>>>,
  showErrorAlert: boolean,
  setShowErrorAlert: React.Dispatch<React.SetStateAction<boolean>>,
};

interface AddModalProps extends ModalProps {
  title: string,
  modalID: string,
  size?: "sm" | "lg" | "xl",
  onSubmit?: () => void,
  onValidatedSubmit: () => void,
  submitDisabled?: boolean,
  validateSubmit: () => boolean,
  children: React.ReactNode,
};

const AddModal = ({
  show, setShow, errors, setErrors, showErrorAlert, setShowErrorAlert,
  title,
  modalID,
  size = undefined,
  onSubmit = () => {},
  onValidatedSubmit,
  submitDisabled = false,
  validateSubmit,
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
    onSubmit?.();

    if (validateSubmit()) {
      onValidatedSubmit();
      setShow(false);
    }
  };

  return (
    <BootstrapModal id={modalID}
      size={size} aria-labelledby={`${modalID}Label`} show={show} onEntered={handleEntered} onHide={handleClose}       
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