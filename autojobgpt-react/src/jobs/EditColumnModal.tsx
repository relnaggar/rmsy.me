import React from "react";
import BootstrapModal from 'react-bootstrap/Modal';

import InputWithSave from "../common/InputWithSave";
import { Status } from '../api/types';


interface EditColumnModalProps {
  apiPath: string,
  show: boolean,
  setShow: React.Dispatch<React.SetStateAction<boolean>>,
  statusId: number,
  statuses: Status[]
  setStatuses: React.Dispatch<React.SetStateAction<Status[]>>,
};

const EditColumnModal = ({
  apiPath,
  show, setShow,
  statusId,
  statuses, setStatuses,
}: EditColumnModalProps): React.JSX.Element => {
  const modalId = `editColumnModal${statusId}`;
  const title = "Edit Column";

  const handleEntered = (): void => {
    const firstInputElement: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null =
      document.getElementById(modalId)!.querySelector('input, select, textarea');
    firstInputElement?.focus();
  };

  const handleClose = () => {
    setShow(false);
  };

  return (
    <BootstrapModal id={modalId}
      backdrop="static" aria-labelledby={`${modalId}Label`} show={show} onEntered={handleEntered} onHide={handleClose}
    >
      <BootstrapModal.Header closeButton>
        <BootstrapModal.Title id={`${modalId}Label`}>{title}</BootstrapModal.Title>
      </BootstrapModal.Header>
      <BootstrapModal.Body>
        <InputWithSave id={statusId}
          type="text"
          apiPath={apiPath}
          resources={statuses}
          setResources={setStatuses}          
          editableProperty="name"
          labelText="Column Name"
          validateSubmit={(value: string) => {
            const errors: Record<string,string[]> = {};
            if (value === "") {
              errors["name"] = ["Please enter a column name."];
            }
            return errors;
          }}
        />
      </BootstrapModal.Body>
      <BootstrapModal.Footer>
        <button type="button" className="btn btn-secondary" onClick={handleClose}>Close</button>
      </BootstrapModal.Footer>
    </BootstrapModal>
  )
};

export default EditColumnModal;