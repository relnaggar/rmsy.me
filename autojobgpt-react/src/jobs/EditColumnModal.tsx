import React from "react";
import Modal from 'react-bootstrap/Modal';

import InputWithSave from "../common/InputWithSave";
import { Status } from "./types";


export default function EditColumnModal({
  apiPath,
  show, setShow,
  statusID,
  statuses, setStatuses,
}: {
  apiPath: string,
  show: boolean,
  setShow: React.Dispatch<React.SetStateAction<boolean>>,
  statusID: number,
  statuses: Status[]
  setStatuses: React.Dispatch<React.SetStateAction<Status[]>>,
}): React.JSX.Element {
  return (
    <Modal aria-labelledby="editColumnModalLabel" backdrop="static"
      show={show} onHide={() => setShow(false)}
      onEntered={() => document.getElementsByTagName("input")[0].focus()}      
    >
      <Modal.Header closeButton>
        <Modal.Title id="editColumnModalLabel">Edit Column</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <InputWithSave<Status>
          type="text"
          apiPath={apiPath}
          resources={statuses}
          setResources={setStatuses}
          id={statusID}
          editableProperty="name"
          labelText="Column Name"
        />
      </Modal.Body>
      <Modal.Footer>
        <button type="button" className="btn btn-secondary" onClick={() => setShow(false)}>Close</button>
      </Modal.Footer>
    </Modal>
  )
}