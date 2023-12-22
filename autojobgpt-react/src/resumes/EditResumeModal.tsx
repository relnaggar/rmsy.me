import React, { useState } from "react";
import BootstrapModal from 'react-bootstrap/Modal';
import BootstrapAlert from 'react-bootstrap/Alert';
import { ReactComponent as BoxArrowUpRightIcon } from 'bootstrap-icons/icons/box-arrow-up-right.svg';
import { ReactComponent as FileArrowDownIcon } from 'bootstrap-icons/icons/file-arrow-down.svg';
import { ReactComponent as CopyIcon } from 'bootstrap-icons/icons/copy.svg';

import usePost from "../hooks/usePost";
import { EditResourceModalProps } from "../common/EditModal";
import InputWithSave from "../common/InputWithSave";
import SubstitutionInput from "./SubstitutionInput";
import { Job, Substitution, Resume } from '../api/types';


interface EditResumeModalProps extends EditResourceModalProps<Resume> {
  substitutions: Substitution[],
  setSubstitutions: React.Dispatch<React.SetStateAction<Substitution[]>>,
  onSubstitutionSaveSuccess: () => void,
}

const EditResumeModal = ({
  show, setShow, editId,
  substitutions,
  setSubstitutions,
  onSubstitutionSaveSuccess,
  apiPath, resources, setResources,
}: EditResumeModalProps): React.JSX.Element => {
  const resume: Resume | undefined = resources.find((resume: Resume) => resume.id === editId);

  const [errors, setErrors] = useState<Record<string,string[]>>({});
  const [showErrorAlert, setShowErrorAlert] = useState<boolean>(false);

  const handleDuplicateSuccess = (resume: Resume) => {
    setResources([...resources, resume]);
    setShowErrorAlert(false);
  };

  const handleDuplicateFail = (es: Record<string,string[]>) => {
    setErrors(es);
    setShowErrorAlert(true);
  };

  const { posting: duplicating, post: duplicate } = usePost<Resume>(
    `${apiPath}${editId}/duplicate/`, {
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
        <InputWithSave editId={editId}          
          apiPath={apiPath} resources={resources} setResources={setResources}   
          type="text" editableProperty="name" labelText="Resume Name"
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
          .filter((substitution: Substitution) => substitution.resume === editId)
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
          onClick={handleClickDuplicate} disabled={duplicating}
        >
          {duplicating?<>
            <span className="spinner-border spinner-border-sm me-1" aria-hidden="true"></span>
            Duplicating...
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