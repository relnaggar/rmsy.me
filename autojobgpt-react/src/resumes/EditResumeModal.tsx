import React, { useId } from "react";
import { ReactComponent as BoxArrowUpRightIcon } from 'bootstrap-icons/icons/box-arrow-up-right.svg';
import { ReactComponent as FileArrowDownIcon } from 'bootstrap-icons/icons/file-arrow-down.svg';
import { ReactComponent as CopyIcon } from 'bootstrap-icons/icons/copy.svg';

import EditModal, { EditResourceModalProps } from "../common/EditModal";
import InputWithSave from "../common/InputWithSave";
import SubstitutionInput from "./SubstitutionInput";
import { Job, Substitution, Resume } from '../api/types';


interface EditResumeModalProps extends EditResourceModalProps<Resume> {
  substitutions: Substitution[],
  setSubstitutions: React.Dispatch<React.SetStateAction<Substitution[]>>,
  onSubstitutionSaveSuccess: () => void,
  onClickDuplicate: (id: number) => (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void,
}

const EditResumeModal = ({
  show, setShow, editId,
  apiPath, resources, setResources,
  substitutions,
  setSubstitutions,
  onSubstitutionSaveSuccess,
  onClickDuplicate,
}: EditResumeModalProps): React.JSX.Element => {
  const modalId = useId();
  const resume: Resume | undefined = resources.find((resume: Resume) => resume.id === editId);

  const duplicateButton = (
    <button className="btn btn-outline-primary" type="button" onClick={onClickDuplicate(editId)}>
      <CopyIcon className="me-1" />
      Duplicate
    </button>
  );

  return (
    <EditModal modalId={modalId}
      title={"Edit Resume"} show={show} setShow={setShow} size="xl" footerButton={duplicateButton}
    >
      <InputWithSave editId={editId}          
        apiPath={apiPath} resources={resources} setResources={setResources}   
        type="text" editableProperty="name" labelText="Resume Name"
        required
      />
      { resume &&
        <div className="d-flex flex-wrap">
          <div className="mb-3 me-1 flex-fill">
            <span className="form-label">Job</span>
            <a
              href={resume.job!.url} target="_blank" rel="noreferrer"
              className="link-primary form-control border border-0"
            >
              {resume.job!.title + ", " + (resume.job as Job).company}
              <BoxArrowUpRightIcon className="ms-1" />
            </a>
          </div>
          <div className="mb-3 me-1 flex-fill">
            <span className="form-label">Template</span>
            <a download href={resume.template!.docx} className="form-control link-primary border border-0">
              {resume!.template.name}
              <FileArrowDownIcon className="ms-1" />
            </a>
          </div>
          <div className="mb-3 me-1 flex-fill">
            <span className="form-label">Resume</span>
            <a download href={resume!.docx} className="form-control link-primary border border-0">
              Version {resume.version}
              <FileArrowDownIcon className="ms-1" />
            </a>
          </div>
        </div>
      }
      <hr />
      <h5 className="mb-3">Fill Field Substitutions</h5>
      { substitutions
        .filter((substitution: Substitution) => substitution.resume === editId)
        .map((substitution: Substitution) => {
          return (
            <SubstitutionInput key={substitution.id}
              substitution={substitution}
              substitutions={substitutions}
              setSubstitutions={setSubstitutions}
              onSubstitutionSaveSuccess={onSubstitutionSaveSuccess}
            />
          );
        })
      }
    </EditModal>
  )
};

export default EditResumeModal;