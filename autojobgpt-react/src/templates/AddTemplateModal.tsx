import React from "react";

import useInputControl from "../hooks/useInputControl";
import AddModal, { AddResourceModalProps } from "../common/AddModal";
import BaseInput from "../common/BaseInput";
import { ResumeTemplateUpload } from '../api/types';


const AddTemplateModal = ({
  postResource: postTemplate,
  ...addModal
}: AddResourceModalProps<ResumeTemplateUpload>): React.JSX.Element => {
  const nameInput = useInputControl();
  const uploadInput = useInputControl();
  const descriptionInput = useInputControl();

  const modalId: string = `addTemplateModal`;

  const validateSubmit = (): boolean => {
    let valid = true;
    const newErrors: Record<string,string[]> = {};

    if (nameInput.value === "") {
      newErrors["name"] = ["Please enter a template name."];
      valid = false;
    }
    if ((uploadInput.ref.current as HTMLInputElement).files?.length === 0) {
      newErrors["upload"] = ["Please upload a template file."];
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
    postTemplate({ name: nameInput.value, docx, description: descriptionInput.value });
  };

  return (
    <AddModal
      {...addModal} errors={{error: addModal.errors["error"]}}
      title="Add Resume Template" modalId={modalId}
      validateSubmit={validateSubmit} onValidatedSubmit={handleValidatedSubmit}
    >
      <BaseInput id={`${modalId}Name`} ref={nameInput.ref}
        value={nameInput.value} editing={nameInput.editing} handleChange={nameInput.handleChange}
        label="Template Name" type="text" errors={addModal.errors["name"]}
      />
      <BaseInput id={`${modalId}Upload`} ref={uploadInput.ref}
        value={uploadInput.value} editing={uploadInput.editing} handleChange={uploadInput.handleChange}
        label="Upload" type="file" errors={addModal.errors["upload"]}
        accept=".doc,.docx,.xml,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      />
      <BaseInput id={`${modalId}Description`} ref={descriptionInput.ref}
        value={descriptionInput.value} editing={descriptionInput.editing} handleChange={descriptionInput.handleChange}
        label="Description (optional)" type="textarea" errors={addModal.errors["description"]} rows={3}         
      />
    </AddModal>
  )
};

export default AddTemplateModal;