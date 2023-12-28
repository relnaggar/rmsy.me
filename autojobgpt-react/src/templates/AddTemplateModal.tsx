import React, { useId } from "react";

import useInputControl from "../hooks/useInputControl";
import AddModal, { AddResourceModalProps } from "../common/AddModal";
import BaseInput from "../common/BaseInput";
import { TemplateUpload } from '../api/types';
import { DocumentsPageProps } from '../routes/DocumentsPage';


interface AddTemplateModalProps extends AddResourceModalProps<TemplateUpload>, DocumentsPageProps {};

const AddTemplateModal = ({
  postResource: postTemplate,
  documentType,
  documentTypeLabel,
  ...addModal
}: AddTemplateModalProps): React.JSX.Element => {
  const nameInput = useInputControl();
  const uploadInput = useInputControl();
  const descriptionInput = useInputControl();

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
    for (const input of [nameInput, uploadInput, descriptionInput]) {
      input.stopEditing();
    }

    return valid;
  };

  const handleValidatedSubmit = (): void => {
    const docx: File = (uploadInput.ref.current as HTMLInputElement).files![0];
    postTemplate({ name: nameInput.value, docx, description: descriptionInput.value, type: documentType });
  };

  return (
    <AddModal
      {...addModal} errors={{error: addModal.errors["error"]}}
      title={`Add ${documentTypeLabel} Template`} modalId={modalId}
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
      <BaseInput ref={descriptionInput.ref}
        value={descriptionInput.value} editing={descriptionInput.editing} handleChange={descriptionInput.handleChange}
        label="Description (optional)" type="textarea" errors={addModal.errors["description"]} rows={3}         
      />
    </AddModal>
  )
};

export default AddTemplateModal;