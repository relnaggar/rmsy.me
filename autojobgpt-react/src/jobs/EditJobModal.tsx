import React from "react";
import BootstrapModal from 'react-bootstrap/Modal';

import { EditResourceModalProps } from "../common/EditModal";
import InputWithSave from "../common/InputWithSave";
import { Status, Job } from '../api/types';


interface EditJobModalProps extends EditResourceModalProps<Job> {
  statuses: Status[],
};

const EditJobModal = ({
  show, setShow, editId,
  statuses,
  ...resourceManager
}: EditJobModalProps): React.JSX.Element => {
  if (editId === -1) {
    return <></>;
  }

  return (
    <BootstrapModal aria-labelledby="editJobModalLabel" size="lg" backdrop="static"
      show={show} onHide={() => setShow(false)}
      onEntered={() => document.getElementsByTagName("input")[0].focus()}      
    >
      <BootstrapModal.Header closeButton>
        <BootstrapModal.Title id="editJobModalLabel">Edit Job</BootstrapModal.Title>
      </BootstrapModal.Header>
      <BootstrapModal.Body>
        <InputWithSave editId={editId} {...resourceManager}
          type="select" editableProperty="status" labelText="Status"
          selectOptions={statuses.map((status: Status) => {
            return {value: status.id.toString(), label: status.name}
          })}
          required              
        />
        <InputWithSave editId={editId} {...resourceManager}
          type="url" editableProperty="url" labelText="URL"
        />
        <InputWithSave editId={editId} {...resourceManager}
          type="text" editableProperty="title" labelText="Title"
          required
        />
        <InputWithSave editId={editId} {...resourceManager}
          type="text" editableProperty="company" labelText="Company"
          required
        />
        <InputWithSave editId={editId} {...resourceManager}
          type="textarea" editableProperty="posting" labelText="Posting"
          required
        />
      </BootstrapModal.Body>
      <BootstrapModal.Footer>
        <button type="button" className="btn btn-secondary" onClick={() => setShow(false)}>Close</button>
      </BootstrapModal.Footer>
    </BootstrapModal>
  )
};

export default EditJobModal;