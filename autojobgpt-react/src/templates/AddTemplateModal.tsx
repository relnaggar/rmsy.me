import React, { useId } from "react";

import useInputControl from "../hooks/useInputControl";
import AddModal, { AddResourceModalProps } from "../common/AddModal";
import BaseInput from "../common/BaseInput";
import { DocumentsPageProps } from '../routes/DocumentsPage';
import { TemplateUpload } from '../api/types';
import { additionalInformationHelpText } from './helpText';


interface AddTemplateModalProps extends AddResourceModalProps<TemplateUpload>, DocumentsPageProps {};

const AddTemplateModal = ({
  postResource: postTemplate,
  documentType,
  documentTypeLabel,
  ...addModal
}: AddTemplateModalProps): React.JSX.Element => {
  const nameInput = useInputControl("name");
  const uploadInput = useInputControl("docx");
  const additionalInformationInput = useInputControl("additional_information");

  const modalId = useId();

  const validateSubmit = (): boolean => {
    let valid = true;
    const newErrors: Record<string,string[]> = {};

    if (nameInput.value === "") {
      newErrors[nameInput.name] = ["Template name is required."];
      valid = false;
    }
    if ((uploadInput.ref.current as HTMLInputElement).files?.length === 0) {
      newErrors[uploadInput.name] = ["Upload is required."];
      valid = false;
    }

    addModal.setErrors(newErrors);
    for (const input of [nameInput, uploadInput, additionalInformationInput]) {
      input.stopEditing();
    }

    return valid;
  };

  const handleValidatedSubmit = (): void => {
    const docx: File = (uploadInput.ref.current as HTMLInputElement).files![0];
    postTemplate({ name: nameInput.value, docx, additional_information: additionalInformationInput.value, type: documentType });
  };

  return (
    <AddModal
      {...addModal} errors={{error: addModal.errors["error"]}}
      title={`Add ${documentTypeLabel} Template`} modalId={modalId} size="xl"
      validateSubmit={validateSubmit} onValidatedSubmit={handleValidatedSubmit}
    >
      <BaseInput ref={nameInput.ref} name={nameInput.name}
        value={nameInput.value} editing={nameInput.editing} handleChange={nameInput.handleChange}
        label="Template Name" type="text" errors={addModal.errors[nameInput.name]}
      />
      <BaseInput ref={uploadInput.ref} name={uploadInput.name}
        value={uploadInput.value} editing={uploadInput.editing} handleChange={uploadInput.handleChange}
        label="Upload" type="file" errors={addModal.errors[uploadInput.name]}
        accept=".doc,.docx,.xml,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        helpText="Only .docx files are supported."
      />
      <BaseInput ref={additionalInformationInput.ref} name={additionalInformationInput.name}
        value={additionalInformationInput.value} editing={additionalInformationInput.editing} handleChange={additionalInformationInput.handleChange}
        label="Additional Information (optional)" type="textarea" errors={addModal.errors[additionalInformationInput.name]} rows={3}
        helpText={additionalInformationHelpText}
      />
    </AddModal>
  )
};

export default AddTemplateModal;