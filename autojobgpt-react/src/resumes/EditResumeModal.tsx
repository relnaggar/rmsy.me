import React from "react";
import Modal from 'react-bootstrap/Modal';
import { ReactComponent as BoxArrowUpRight } from 'bootstrap-icons/icons/box-arrow-up-right.svg';
import { ReactComponent as FileArrowDown } from 'bootstrap-icons/icons/file-arrow-down.svg';

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
              <span className="form-label">Job</span>
              <a
                id="job" href={(resume.job as Job).url} target="_blank" rel="noreferrer"
                className="form-control link-primary border border-0"
              >
                {(resume.job as Job).title + ", " + (resume.job as Job).company}
                <BoxArrowUpRight className="ms-1" />
              </a>
            </div>
            <div className="mb-3">
              <span className="form-label">Template</span>
              <a
                id="template" href={(resume.template as ResumeTemplate).docx}
                className="form-control link-primary border border-0"
              >
                {(resume.template as ResumeTemplate).name}
                <FileArrowDown className="ms-1" />
              </a>
            </div>
          </>
        }

        <hr />
        <h5 className="mb-3">Fill Field Substitutions</h5>
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