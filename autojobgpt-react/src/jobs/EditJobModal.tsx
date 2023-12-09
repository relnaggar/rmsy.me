import React from "react";
import BootstrapModal from 'react-bootstrap/Modal';

import InputWithSave from "../common/InputWithSave";
import { Status, Job } from '../api/types';


interface EditJobModalProps {
  apiPath: string,
  show: boolean,
  setShow: React.Dispatch<React.SetStateAction<boolean>>,
  jobs: Job[],
  setJobs: React.Dispatch<React.SetStateAction<Job[]>>,
  id: number,
  statuses: Status[],
}

const EditJobModal = ({
  apiPath,
  show,
  setShow,
  jobs,
  setJobs,
  id,
  statuses
}: EditJobModalProps): React.JSX.Element => {
  if (id === -1) {
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
        <InputWithSave<Job>
          type="select"
          apiPath={apiPath}
          resources={jobs}
          setResources={setJobs}
          id={id}
          editableProperty="status"
          labelText="Status"
          selectOptions={statuses.map((status: Status) => {
            return {value: status.id.toString(), label: status.name}
          })}
          required              
        />
        <InputWithSave<Job>
          type="url"
          apiPath={apiPath}
          resources={jobs}
          setResources={setJobs}
          id={id}
          editableProperty="url"
          labelText="URL"
        />
        <InputWithSave<Job>
          type="text"
          apiPath={apiPath}
          resources={jobs}
          setResources={setJobs}
          id={id}
          editableProperty="title"
          labelText="Title"
          required
        />
        <InputWithSave<Job>
          type="text"
          apiPath={apiPath}
          resources={jobs}
          setResources={setJobs}
          id={id}
          editableProperty="company"
          labelText="Company"
          required
        />
        <InputWithSave<Job>
          type="textarea"
          apiPath={apiPath}
          resources={jobs}
          setResources={setJobs}
          id={id}
          editableProperty="posting"
          labelText="Posting"
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