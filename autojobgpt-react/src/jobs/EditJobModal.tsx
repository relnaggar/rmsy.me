import React from "react";
import Modal from 'react-bootstrap/Modal';

import InputWithSave from "../common/InputWithSave";
import { Job } from "../jobs/types";


export default function EditJobModal({ apiPath, show, setShow, jobs, setJobs, id }: {
  apiPath: string,
  show: boolean,
  setShow: React.Dispatch<React.SetStateAction<boolean>>,
  jobs: Job[],
  setJobs: React.Dispatch<React.SetStateAction<Job[]>>,
  id: number
}): React.JSX.Element {
  return (
    <Modal show={show} onHide={() => setShow(false)}
      onEntered={() => document.getElementsByTagName("input")[0].focus()}
      aria-labelledby="editJobModalLabel"
    >
      <Modal.Header closeButton>
        <Modal.Title id="editJobModalLabel">Edit Job</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <InputWithSave<Job>
          type="url"
          apiPath={apiPath}
          resources={jobs}
          setResources={setJobs}
          id={id}
          editableProperty="url"
          labelText="URL"
        />

        <hr />

        <h5>Details</h5>
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
      </Modal.Body>
      <Modal.Footer>
        <button type="button" className="btn btn-secondary" onClick={() => setShow(false)}>Close</button>
      </Modal.Footer>
    </Modal>
  )
}