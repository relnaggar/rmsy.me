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
  const nameInput = useInputControl();
  const uploadInput = useInputControl();
  const additionalInformationInput = useInputControl();

  const modalId = useId();

  const validateSubmit = (): boolean => {
    let valid = true;
    const newErrors: Record<string,string[]> = {};

    if (nameInput.value === "") {
      newErrors["name"] = ["Template name is required."];
      valid = false;
    }
    if ((uploadInput.ref.current as HTMLInputElement).files?.length === 0) {
      newErrors["upload"] = ["Upload is required."];
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
      <BaseInput ref={nameInput.ref}
        value={nameInput.value} editing={nameInput.editing} handleChange={nameInput.handleChange}
        label="Template Name" type="text" errors={addModal.errors["name"]}
      />
      <BaseInput ref={uploadInput.ref}
        value={uploadInput.value} editing={uploadInput.editing} handleChange={uploadInput.handleChange}
        label="Upload" type="file" errors={addModal.errors["upload"]}
        accept=".doc,.docx,.xml,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      />
      <BaseInput ref={additionalInformationInput.ref}
        value={additionalInformationInput.value} editing={additionalInformationInput.editing} handleChange={additionalInformationInput.handleChange}
        label="Additional Information (optional)" type="textarea" errors={addModal.errors["additional_information"]} rows={3}
        helpText={additionalInformationHelpText}
      />
    </AddModal>
  )
};

export default AddTemplateModal;