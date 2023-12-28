import React, { useId } from "react";

import EditModal, { EditResourceModalProps } from "../common/EditModal";
import InputWithSave from "../common/InputWithSave";
import { defaultFillFields } from "../api/constants";
import { FillField, Template } from '../api/types';
import DefaultFillField from "./DefaultFillField";
import { DocumentsPageProps } from "../routes/DocumentsPage";


interface EditTemplateModalProps extends
  EditResourceModalProps<Template>,
  Pick<DocumentsPageProps, "documentTypeLabel">
{
  fillFields: FillField[],
  setFillFields: React.Dispatch<React.SetStateAction<FillField[]>>,
}

const EditTemplateModal = ({
  show, setShow, editId,
  fillFields, setFillFields,
  documentTypeLabel,
  ...resourceManager
}: EditTemplateModalProps): React.JSX.Element => {
  const modalId = useId();

  return (
    <EditModal title={`Edit ${documentTypeLabel} Template`} modalId={modalId} show={show} setShow={setShow} size="xl">
      <InputWithSave editId={editId} {...resourceManager}
        type="text" editableProperty="name" labelText={`${documentTypeLabel} Template Name`}
        required
      />
      <InputWithSave editId={editId} {...resourceManager}
        type="textarea" editableProperty="description" labelText="Description (optional)"
      />
      <hr />
      <h5 className="mb-3">Fill Field Descriptions</h5>
      {fillFields
        .filter((fillField: FillField) => fillField.template === editId)
        .map((fillField: FillField) =>
          defaultFillFields.includes(fillField.key) ?
            <DefaultFillField key={fillField.id} fillField={fillField} />
          :
            <InputWithSave key={fillField.id} editId={fillField.id}
              apiPath="fillFields/" resources={fillFields} setResources={setFillFields}
              type="textarea" editableProperty="description" labelProperty="key"
            />
        )
      }
    </EditModal>
  )
};

export default EditTemplateModal;