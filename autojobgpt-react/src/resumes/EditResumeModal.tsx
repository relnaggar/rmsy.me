import React, { useState, useCallback } from "react";
import BootstrapModal from 'react-bootstrap/Modal';
import BootstrapAlert from 'react-bootstrap/Alert';
import { ReactComponent as BoxArrowUpRightIcon } from 'bootstrap-icons/icons/box-arrow-up-right.svg';
import { ReactComponent as FileArrowDownIcon } from 'bootstrap-icons/icons/file-arrow-down.svg';
import { ReactComponent as CopyIcon } from 'bootstrap-icons/icons/copy.svg';

import usePost from "../hooks/usePost";
import InputWithSave from "../common/InputWithSave";
import SubstitutionInput from "./SubstitutionInput";
import { Job, Substitution, Resume } from '../api/types';


interface EditResumeModalProps {
  apiPath: string,
  resumes: Resume[],
  setResumes: React.Dispatch<React.SetStateAction<Resume[]>>,
  show: boolean,
  setShow: React.Dispatch<React.SetStateAction<boolean>>,
  resumeId: number,
  substitutions: Substitution[],
  setSubstitutions: React.Dispatch<React.SetStateAction<Substitution[]>>,
  onSubstitutionSaveSuccess: () => void,
}

const EditResumeModal = ({
  apiPath,
  resumes,
  setResumes,
  show,
  setShow,
  resumeId,
  substitutions,
  setSubstitutions,
  onSubstitutionSaveSuccess,
}: EditResumeModalProps): React.JSX.Element => {
  const resume: Resume | undefined = resumes.find((resume: Resume) => resume.id === resumeId);

  const [errors, setErrors] = useState<Record<string,string[]>>({});
  const [showErrorAlert, setShowErrorAlert] = useState<boolean>(false);

  const handleDuplicateSuccess = useCallback((resume: Resume) => {
    setResumes([...resumes, resume]);
    setShowErrorAlert(false);
  }, [resumes, setResumes]);

  const handleDuplicateFail = useCallback((es: Record<string,string[]>) => {
    setErrors(es);
    setShowErrorAlert(true);
  }, []);

  const { posting: duplicating, post: duplicate, cancel: cancelDuplicate } = usePost<Resume>(
    `${apiPath}${resumeId}/duplicate/`, {
      onSuccess: handleDuplicateSuccess,
      onFail: handleDuplicateFail,
    }
  );

  const handleClickDuplicate = (): void => {
    setShowErrorAlert(false);
    duplicate();
  }

  const handleClose = (): void => {
    setShowErrorAlert(false);
    setShow(false);    
  }  

  return (
    <BootstrapModal
      show={show} onHide={handleClose} aria-labelledby="editResumeModalLabel"
      onEntered={() => document.getElementsByTagName("input")[0].focus()} size="xl" backdrop="static"
    >
      <BootstrapModal.Header closeButton>
        <BootstrapModal.Title id="editResumeModalLabel">Edit Resume</BootstrapModal.Title>
      </BootstrapModal.Header>
      <BootstrapModal.Body>
        <InputWithSave<Resume>
          type="text"
          apiPath={apiPath}
          resources={resumes}
          setResources={setResumes}
          id={resumeId}
          editableProperty="name"
          labelText="Resume Name"
          required
        />

        {resume &&
          <div className="d-flex flex-wrap">
            <div className="mb-3 flex-fill">
              <span className="form-label">Job</span>
              <a
                href={resume.job!.url} target="_blank" rel="noreferrer"
                className="link-primary form-control border border-0"
              >
                {resume.job!.title + ", " + (resume.job as Job).company}
                <BoxArrowUpRightIcon className="ms-1" />
              </a>
            </div>
            <div className="mb-3 flex-fill">
              <span className="form-label">Template</span>
              <a href={resume.template!.docx} className="form-control link-primary border border-0">
                {resume!.template.name}
                <FileArrowDownIcon className="ms-1" />
              </a>
            </div>
            <div className="mb-3 flex-fill">
              <span className="form-label">Resume</span>
              <a href={resume!.docx} className="form-control link-primary border border-0">
                Version {resume.version}
                <FileArrowDownIcon className="ms-1" />
              </a>
            </div>
          </div>
        }

        <hr />
        <h5 className="mb-3">Fill Field Substitutions</h5>
        {substitutions
          .filter((substitution: Substitution) => substitution.resume === resumeId)
          .map((substitution: Substitution) => {
            return (
              <SubstitutionInput
                substitution={substitution}
                substitutions={substitutions}
                setSubstitutions={setSubstitutions}
                onSubstitutionSaveSuccess={onSubstitutionSaveSuccess}
              />
            );
          })
        }
      </BootstrapModal.Body>
      <BootstrapModal.Footer>
        <BootstrapAlert
            variant="danger" dismissible className="w-100"
            show={showErrorAlert} onClose={() => setShowErrorAlert(false)}
          >
            {Object.values(errors).join(" ")}
        </BootstrapAlert>
        <button className="btn btn-outline-primary" type="button"
          onClick={duplicating ? () => cancelDuplicate() : handleClickDuplicate }
        >
          {duplicating?<>
            <span className="spinner-border spinner-border-sm me-1" aria-hidden="true"></span>
            Cancel
          </>:<>
            <CopyIcon className="me-1" />
            Duplicate
          </>}
        </button>
        <button type="button" className="btn btn-secondary" onClick={handleClose}>Close</button>
      </BootstrapModal.Footer>
    </BootstrapModal>
  )
};

export default EditResumeModal;