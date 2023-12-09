import React from "react";
import BootstrapModal from 'react-bootstrap/Modal';

import InputWithSave from "../common/InputWithSave";
import { Status } from "./types";


interface EditColumnModalProps {
  apiPath: string,
  show: boolean,
  setShow: React.Dispatch<React.SetStateAction<boolean>>,
  statusID: number,
  statuses: Status[]
  setStatuses: React.Dispatch<React.SetStateAction<Status[]>>,
};

const EditColumnModal = ({
  apiPath,
  show, setShow,
  statusID,
  statuses, setStatuses,
}: EditColumnModalProps): React.JSX.Element => {
  return (
    <BootstrapModal aria-labelledby="editColumnModalLabel" backdrop="static"
      show={show} onHide={() => setShow(false)}
      onEntered={() => document.getElementsByTagName("input")[0].focus()}      
    >
      <BootstrapModal.Header closeButton>
        <BootstrapModal.Title id="editColumnModalLabel">Edit Column</BootstrapModal.Title>
      </BootstrapModal.Header>
      <BootstrapModal.Body>
        <InputWithSave<Status>
          type="text"
          apiPath={apiPath}
          resources={statuses}
          setResources={setStatuses}
          id={statusID}
          editableProperty="name"
          labelText="Column Name"
        />
      </BootstrapModal.Body>
      <BootstrapModal.Footer>
        <button type="button" className="btn btn-secondary" onClick={() => setShow(false)}>Close</button>
      </BootstrapModal.Footer>
    </BootstrapModal>
  )
};

export default EditColumnModal;