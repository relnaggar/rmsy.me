import React, { useState } from "react";
import Modal from 'react-bootstrap/Modal';
import Alert from 'react-bootstrap/Alert';

import useFetch from "../hooks/useFetch";
import useFormInput from "../hooks/useFormInput";
import FormInput from "../common/FormInput";
import { JobUpload, JobDetails } from "./types";


export default function AddJobModal({
  show, setShow,
  addingJob, addJob,
  addJobErrors, showAddJobErrorAlert, setShowAddJobErrorAlert,
}: {
  show: boolean,
  setShow: (show: boolean) => void,
  addingJob: boolean,
  addJob: (jobUpload: JobUpload) => void,
  addJobErrors: Record<string,string>,
  showAddJobErrorAlert: boolean,
  setShowAddJobErrorAlert: React.Dispatch<React.SetStateAction<boolean>>,
}): React.JSX.Element {
  const urlInput = useFormInput();
  const titleInput = useFormInput();
  const companyInput = useFormInput();
  const postingInput = useFormInput();

  const [fillErrors, setFillErrors] = useState<Record<string,string>>({});
  const [showFillErrorAlert, setShowFillErrorAlert] = useState<boolean>(false);

  function onFillSuccess(jobDetails: JobDetails): void {
    titleInput.edit(jobDetails.title);
    companyInput.edit(jobDetails.company);
    postingInput.edit(jobDetails.posting);
  }

  function onFillFail(errors: Record<string,string>): void {
    setFillErrors(errors);
    if (Object.keys(errors).filter((key) => key !== "url").length > 0) {
      setShowFillErrorAlert(true);
    }
  }

  const { fetching: filling, refetch: fill, cancel: cancelFill } = useFetch<JobDetails>(
    `jobs/extract-details-from-url`, {
    initialFetch: false,
    onSuccess: onFillSuccess,
    onFail: onFillFail,
  });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>): void {    
    e.preventDefault(); // prevent page from reloading

    setShowFillErrorAlert(false);
    setShowAddJobErrorAlert(false);

    const formElement: HTMLFormElement = document.getElementById("addJobForm") as HTMLFormElement;
    if (formElement.reportValidity()) {
      const url: string = (document.getElementById("url") as HTMLInputElement).value;
      const title: string = (document.getElementById("title") as HTMLInputElement).value;
      const company: string = (document.getElementById("company") as HTMLInputElement).value;
      const posting: string = (document.getElementById("posting") as HTMLTextAreaElement).value;
      const jobUpload: JobUpload = {url, title, company, posting, status: "backlog"};
      addJob(jobUpload);
      urlInput.stopEditing();
      titleInput.stopEditing();
      companyInput.stopEditing();
      postingInput.stopEditing();
    }
  }

  function handleClickFillDetails(): void {
    setShowFillErrorAlert(false);
    setShowAddJobErrorAlert(false);
    const urlElement: HTMLInputElement = document.getElementById("url") as HTMLInputElement;
    if (urlElement.reportValidity()) {
      fill(`url=${urlElement.value}`);
      urlInput.stopEditing();
    }
  }

  const loading: boolean = filling || addingJob;

  return (
    <Modal
      show={show} onHide={() => setShow(false)}
      onEntered={() => document.getElementById("url")?.focus()}
      aria-labelledby="addJobModalLabel"
    >
      <Modal.Header closeButton>
        <Modal.Title id="addJobModalLabel">Add Job</Modal.Title>
      </Modal.Header>
      <form onSubmit={handleSubmit} id="addJobForm">
        <Modal.Body>
          <FormInput
            id="url" label="URL" type="url" value={urlInput.value} handleChange={urlInput.handleChange}
            editing={urlInput.editing} loading={loading} error={addJobErrors["url"] || fillErrors["url"]}
            maxLength={2000} minLength={4}
          >
            <button className="btn btn-outline-primary" type="button"
              onClick={filling ? () => cancelFill() : handleClickFillDetails }
            >
              {filling?<>
                <span className="spinner-border spinner-border-sm me-1" aria-hidden="true"></span>
                Cancel
              </>:<>
                Fill Details
              </>}
            </button>
          </FormInput>

          <Alert variant="danger" show={showFillErrorAlert} onClose={() => setShowFillErrorAlert(false)} dismissible>
            {Object.entries(fillErrors).filter(([key, _]) => key !== "url").map(([_, value]) => value).join(" ")}
          </Alert>

          <hr />

          <h5>Details</h5>
          <FormInput
            id="title" label="Title" type="text" value={titleInput.value} handleChange={titleInput.handleChange}
            editing={titleInput.editing} loading={loading} error={addJobErrors["title"]} required maxLength={160}
          />
          <FormInput
            id="company" label="Company" type="text" value={companyInput.value} handleChange={companyInput.handleChange}
            editing={companyInput.editing} loading={loading} error={addJobErrors["company"]} required maxLength={160}
          />
          <FormInput
            id="posting" label="Posting" type="textarea" value={postingInput.value} handleChange={postingInput.handleChange}
            editing={postingInput.editing} loading={loading} error={addJobErrors["posting"]} required
          />
        </Modal.Body>
        <Modal.Footer>
          <Alert variant="danger" show={showAddJobErrorAlert} onClose={() => setShowAddJobErrorAlert(false)} dismissible>
            {addJobErrors["error"]}
          </Alert>

          <button className="btn btn-secondary" type="button" onClick={() => setShow(false)}>Close</button>
          <button className="btn btn-primary" type="submit" disabled={loading} formNoValidate>
            {addingJob?
              <>
                <span className="spinner-border spinner-border-sm me-1" aria-hidden="true"></span>
                Submitting...
              </>
            :
              <>
                Submit
              </>
            }
          </button>
        </Modal.Footer>        
      </form>
    </Modal>
  );
}