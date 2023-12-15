import React from "react";

import useInputControl from "../hooks/useInputControl";
import AddModal, { AddModalMixin } from "../common/AddModal";
import TextInput from "../common/TextInput";
import { UsePostResource } from "../hooks/usePostResource";
import { ResumeTemplateUpload } from '../api/types';


interface AddTemplateModalProps extends Pick<UsePostResource<ResumeTemplateUpload>, "postResource">, AddModalMixin {};

const AddTemplateModal = ({
  postResource: postTemplate,
  ...addModal
}: AddTemplateModalProps): React.JSX.Element => {
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
      <TextInput id={`${modalId}Name`}
        label="Template Name" type="text" value={nameInput.value} handleChange={nameInput.handleChange}
        editing={nameInput.editing} errors={addModal.errors["name"]}
      />
      <TextInput id={`${modalId}Upload`} ref={uploadInput.ref as React.RefObject<HTMLInputElement>}
        label="Upload" type="file" value={uploadInput.value} handleChange={uploadInput.handleChange}
        editing={uploadInput.editing} errors={addModal.errors["upload"]}
        accept=".doc,.docx,.xml,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      />
      <TextInput id={`${modalId}Description`}
        label="Description (optional)" type="textarea" value={descriptionInput.value}
        handleChange={descriptionInput.handleChange}
        editing={descriptionInput.editing} errors={addModal.errors["description"]} rows={3}         
      />
    </AddModal>
  )
};

export default AddTemplateModal;