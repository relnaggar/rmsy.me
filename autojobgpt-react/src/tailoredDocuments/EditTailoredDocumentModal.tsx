import React, { useId } from "react";
import { ReactComponent as BoxArrowUpRightIcon } from 'bootstrap-icons/icons/box-arrow-up-right.svg';
import { ReactComponent as FileArrowDownIcon } from 'bootstrap-icons/icons/file-arrow-down.svg';
import { ReactComponent as CopyIcon } from 'bootstrap-icons/icons/copy.svg';

import EditModal, { EditResourceModalProps } from "../common/EditModal";
import InputWithSave from "../common/InputWithSave";
import SubstitutionInput from "./SubstitutionInput";
import { Job, Substitution, TailoredDocument } from '../api/types';
import { DocumentsPageProps } from "../routes/DocumentsPage";


interface EditTailoredDocumentModalProps extends
  EditResourceModalProps<TailoredDocument>,
  Pick<DocumentsPageProps, "documentTypeLabel">
{
  substitutions: Substitution[],
  setSubstitutions: React.Dispatch<React.SetStateAction<Substitution[]>>,
  onSubstitutionSaveSuccess: () => void,
  onClickDuplicate: (id: number) => (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void,
}

const EditTailoredDocumentModal = ({
  show, setShow, editId,
  apiPath, resources, setResources,
  substitutions,
  setSubstitutions,
  onSubstitutionSaveSuccess,
  onClickDuplicate,
  documentTypeLabel,
}: EditTailoredDocumentModalProps): React.JSX.Element => {
  const modalId = useId();
  const tailoredDocument: TailoredDocument | undefined = resources.find((tailoredDocument: TailoredDocument) => tailoredDocument.id === editId);

  const duplicateButton = (
    <button className="btn btn-outline-primary" type="button" onClick={onClickDuplicate(editId)}>
      <CopyIcon className="me-1" />
      Duplicate
    </button>
  );

  return (
    <EditModal modalId={modalId}
      title={`Edit ${documentTypeLabel}`} show={show} setShow={setShow} size="xl" footerButton={duplicateButton}
    >
      <InputWithSave editId={editId}          
        apiPath={apiPath} resources={resources} setResources={setResources}   
        type="text" editableProperty="name" labelText={`${documentTypeLabel} Name`}
        required
      />
      { tailoredDocument &&
        <div className="d-flex flex-wrap">
          <div className="mb-3 me-1 flex-fill">
            <span className="form-label">Job</span>
            <a
              href={tailoredDocument.job!.url} target="_blank" rel="noreferrer"
              className="link-primary form-control border border-0"
            >
              {tailoredDocument.job!.title + ", " + (tailoredDocument.job as Job).company}
              <BoxArrowUpRightIcon className="ms-1" />
            </a>
          </div>
          <div className="mb-3 me-1 flex-fill">
            <span className="form-label">Template</span>
            <a download href={tailoredDocument.template!.docx} className="form-control link-primary border border-0">
              {tailoredDocument!.template.name}
              <FileArrowDownIcon className="ms-1" />
            </a>
          </div>
          <div className="mb-3 me-1 flex-fill">
            <span className="form-label">{documentTypeLabel}</span>
            <a download href={tailoredDocument!.docx} className="form-control link-primary border border-0">
              Version {tailoredDocument.version}
              <FileArrowDownIcon className="ms-1" />
            </a>
          </div>
        </div>
      }
      <hr />
      <h5 className="mb-3">Fill Field Substitutions</h5>
      { substitutions
        .filter((substitution: Substitution) => substitution.tailored_document === editId)
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

export default EditTailoredDocumentModal;