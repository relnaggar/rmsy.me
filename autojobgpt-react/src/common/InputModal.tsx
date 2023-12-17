import React from "react";
import BootstrapModal from 'react-bootstrap/Modal';

import ErrorAlert, { ErrorAlertMixin } from "./ErrorAlert";


export interface InputModalMixin extends ModalMixin {
  modalId: string,
  title: string,
  size?: "sm" | "lg" | "xl",
};

export interface ModalMixin {
  show: boolean,
  setShow: React.Dispatch<React.SetStateAction<boolean>>,
}

interface InputModalProps extends InputModalMixin, Partial<ErrorAlertMixin> {
  staticBackdrop?: boolean,
  handleSubmit?: (e: React.FormEvent<HTMLFormElement>) => void,
  submitDisabled?: boolean,
};

const InputModal = ({
  modalId, title, show, setShow,  
  size = undefined,
  staticBackdrop = false,
  children,
  handleSubmit,
  submitDisabled = false,
  errors,
  showErrorAlert,
  setShowErrorAlert,
}: React.PropsWithChildren<InputModalProps>): React.JSX.Element => {
  const hasSubmit: boolean = handleSubmit !== undefined;
  const hasErrorAlert: boolean = errors !== undefined && showErrorAlert !== undefined && setShowErrorAlert !== undefined;

  const handleEntered = (): void => {
    const firstInputElement: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null =
      document.getElementById(modalId)!.querySelector('input, select, textarea');
    firstInputElement?.focus();
  };

  const handleClose = () => {
    setShow(false);
  };

  const bodyAndFooter = (
    <>
      <BootstrapModal.Body>
        {children}
      </BootstrapModal.Body>
      <BootstrapModal.Footer>
        { hasErrorAlert &&
          <ErrorAlert errors={errors!} showErrorAlert={showErrorAlert!} setShowErrorAlert={setShowErrorAlert!} />
        }
        <button type="button" className="btn btn-secondary" onClick={handleClose}>Close</button>
        { hasSubmit &&
          <button type="submit" className="btn btn-primary" disabled={submitDisabled} formNoValidate>
            Submit
          </button>
        }
      </BootstrapModal.Footer>
    </>
  );

  return (
    <BootstrapModal id={modalId}
      size={size} backdrop={staticBackdrop ? "static" : undefined} aria-labelledby={`${modalId}Label`} show={show}
      onEntered={handleEntered} onHide={handleClose}
    >
      <BootstrapModal.Header closeButton>
        <BootstrapModal.Title id={`${modalId}Label`}>{title}</BootstrapModal.Title>
      </BootstrapModal.Header>
      { hasSubmit ?
        <form onSubmit={handleSubmit}>
          {bodyAndFooter}
        </form>
      :
        bodyAndFooter
      }
    </BootstrapModal>
  );
};

export default InputModal;