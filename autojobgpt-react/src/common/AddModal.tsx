import React from "react";
import BootstrapModal from 'react-bootstrap/Modal';

import { ErrorAlertMixin } from "../hooks/useErrorAlert";
import ErrorAlert from "./ErrorAlert";


export interface AddModalMixin extends ErrorAlertMixin {
  show: boolean,
  setShow: React.Dispatch<React.SetStateAction<boolean>>,
  setErrors: React.Dispatch<React.SetStateAction<Record<string,string[]>>>,
};

interface AddModalProps extends AddModalMixin {
  title: string,
  modalId: string,
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
  modalId,
  size = undefined,
  onSubmit = () => {},
  onValidatedSubmit,
  submitDisabled = false,
  validateSubmit,
  children,
}: AddModalProps): React.JSX.Element => {
  const handleEntered = (): void => {
    const firstInputElement: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null =
      document.getElementById(modalId)!.querySelector('input, select, textarea');
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
    <BootstrapModal id={modalId}
      size={size} aria-labelledby={`${modalId}Label`} show={show} onEntered={handleEntered} onHide={handleClose}       
    >
      <BootstrapModal.Header closeButton>
        <BootstrapModal.Title id={`${modalId}Label`}>{title}</BootstrapModal.Title>
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