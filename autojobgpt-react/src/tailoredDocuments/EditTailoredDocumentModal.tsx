import React, { useId } from "react";
import { ReactComponent as BoxArrowUpRightIcon } from 'bootstrap-icons/icons/box-arrow-up-right.svg';
import { ReactComponent as FileArrowDownIcon } from 'bootstrap-icons/icons/file-arrow-down.svg';
import { ReactComponent as CopyIcon } from 'bootstrap-icons/icons/copy.svg';
import { ReactComponent as EyeIcon } from 'bootstrap-icons/icons/eye.svg';

import EditModal, { EditResourceModalProps } from "../common/EditModal";
import InputWithSave from "../common/InputWithSave";
import SubstitutionInput, { SubstitutionInputProps } from "./SubstitutionInput";
import { Substitution, TailoredDocument } from '../api/types';
import { DocumentsPageProps } from "../routes/DocumentsPage";
import ToggleInput from "../common/ToggleInput";


interface EditTailoredDocumentModalProps extends
  EditResourceModalProps<TailoredDocument>,
  Pick<DocumentsPageProps, "documentTypeLabel">,
  Pick<SubstitutionInputProps, "substitutions" | "setSubstitutions" | "onSubstitutionSaveSuccess">
{
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
              href={tailoredDocument.job.url} target="_blank" rel="noreferrer"
              className="link-primary form-control border border-0"
            >
              {tailoredDocument.job.title + ", " + tailoredDocument.job.company}
              <BoxArrowUpRightIcon className="ms-1" />
            </a>
          </div>
          <div className="mb-3 me-1 flex-fill">
            <span className="form-label">Template</span>
            <a download href={tailoredDocument.template.docx} className="form-control link-primary border border-0">
              {tailoredDocument.template.name}
              <FileArrowDownIcon className="ms-1" />
            </a>
          </div>
          <div className="mb-3 me-1 flex-fill">
            <span className="form-label">{documentTypeLabel}</span>
            <div className="form-control border border-0">
              <a download href={tailoredDocument.docx} className="link-primary">
                Version {tailoredDocument.version}
                <FileArrowDownIcon className="ms-1" />
              </a>
              <a href={tailoredDocument.png} target="_blank" rel="noreferrer" className="link-primary ms-3">
                Preview
                <EyeIcon className="ms-1" />
              </a>
            </div>
          </div>
        </div>
      }
      <hr />
      <h5 className="mb-3">Fill Field Substitutions</h5>
      { tailoredDocument &&
        tailoredDocument.template.paragraphs.map((paragraph, index) =>
          paragraph === "" ?
            <br key={index} />
          :
            <span key={index} className="d-block mb-3">
              {
                paragraph.split(/{{(.*?)}}/).map((part, partIndex) => {
                  const isFillField: boolean = partIndex % 2 !== 0;
                  let substitution: Substitution | undefined = undefined;
                  if (isFillField) {
                    substitution = substitutions.find((substitution: Substitution) =>
                      substitution.tailored_document === editId && substitution.key === part
                    );
                  }
                  return (
                    <React.Fragment key={partIndex}>
                      { isFillField ? (
                        <ToggleInput label={substitution!.value} title={substitution!.key}>
                          <SubstitutionInput
                            substitution={substitution!}
                            substitutions={substitutions}
                            setSubstitutions={setSubstitutions}
                            onSubstitutionSaveSuccess={onSubstitutionSaveSuccess}
                          />
                        </ToggleInput>
                      ) : (
                        part
                      )}
                    </React.Fragment>
                  );
                })
              }
            </span>
        )
      }
    </EditModal>
  )
};

export default EditTailoredDocumentModal;