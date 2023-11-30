import React from "react";
import Modal from 'react-bootstrap/Modal';

import InputWithSave from "../common/InputWithSave";
import { Resume, Substitution } from "./types";
import { Job } from "../jobs/types";
import { ResumeTemplate } from "../templates/types";


export default function EditResumeModal({
  apiPath,
  resumes,
  setResumes,
  show,
  setShow,
  resumeID,
  substitutions,
  setSubstitutions,
  onSubstitutionSaveSuccess,
}: {
  apiPath: string,
  resumes: Resume[],
  setResumes: React.Dispatch<React.SetStateAction<Resume[]>>,
  show: boolean,
  setShow: React.Dispatch<React.SetStateAction<boolean>>,
  resumeID: number,
  substitutions: Substitution[],
  setSubstitutions: React.Dispatch<React.SetStateAction<Substitution[]>>,
  onSubstitutionSaveSuccess: () => void,
}): React.JSX.Element {
  function handleOnEntered() {
    if (document.getElementsByTagName("textarea").length > 0) {
      document.getElementsByTagName("textarea")[0].focus();
    }
  }

  const resume: Resume | undefined = resumes.find((resume: Resume) => resume.id === resumeID);

  return (
    <Modal
      show={show} onHide={() => setShow(false)} aria-labelledby="editResumeModalLabel"
      onEntered={handleOnEntered} size="lg"
    >
      <Modal.Header closeButton>
        <Modal.Title id="editResumeModalLabel">Edit Resume</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <InputWithSave<Resume>
          type="text"
          apiPath={apiPath}
          resources={resumes}
          setResources={setResumes}
          id={resumeID}
          editableProperty="name"
          labelText="Resume Name"
          required
        />

        {resume &&
          <>
            <div className="mb-3">
              <label htmlFor="job" className="form-label">Job</label>
              <input
                type="text" className="form-control" id="job" readOnly disabled
                value={(resume.job as Job).title + ", " + (resume.job as Job).company}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="template" className="form-label">Template</label>
              <input
                type="text" className="form-control" id="template" readOnly disabled
                value={(resume.template as ResumeTemplate).name}
              />
            </div>
          </>
        }

        <hr />
        <h6>Fill Field Substitutions</h6>
        {substitutions
          .filter((substitution: Substitution) => substitution.resume === resumeID)
          .map((substitution: Substitution) => {
            return <InputWithSave<Substitution>
              type="textarea"
              apiPath="resumesubstitutions/"
              resources={substitutions}
              setResources={setSubstitutions}
              id={substitution.id}
              editableProperty="value"
              labelProperty="key"
              onSaveSuccess={onSubstitutionSaveSuccess}
              style={{minHeight: "84px"}}
            >
              <button type="button" className="btn btn-outline-primary" onClick={() => {}}>Autofill</button>
            </InputWithSave>
          })
        }
      </Modal.Body>
      <Modal.Footer>
        <button type="button" className="btn btn-secondary" onClick={() => setShow(false)}>Close</button>
      </Modal.Footer>
    </Modal>
  )
}