import React from "react";

import useInputControl from "../hooks/useInputControl";
import AddModal, { ModalProps } from "../common/AddModal";
import TextInput from "../common/TextInput";
import { ResumeTemplateUpload } from "../templates/types";


interface AddTemplateModalProps extends ModalProps {
  addTemplate: (template: ResumeTemplateUpload) => void,
};

const AddTemplateModal = ({
  show, setShow, errors, setErrors, showErrorAlert, setShowErrorAlert,
  addTemplate,
}: AddTemplateModalProps): React.JSX.Element => {
  const nameInput = useInputControl();
  const uploadInput = useInputControl();
  const descriptionInput = useInputControl();

  const modalID: string = `addTemplateModal`;

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

    setErrors(newErrors);
    for (const input of [nameInput, uploadInput, descriptionInput]) {
      input.stopEditing();
    }

    return valid;
  };

  const handleValidatedSubmit = (): void => {
    const docx: File = (uploadInput.ref.current as HTMLInputElement).files![0];
    addTemplate({ name: nameInput.value, docx, description: descriptionInput.value });
  };

  return (
    <AddModal
      show={show} setShow={setShow} errors={{error: errors["error"]}} setErrors={setErrors}
      showErrorAlert={showErrorAlert} setShowErrorAlert={setShowErrorAlert}
      title="Add Resume Template" modalID={modalID}
      validateSubmit={validateSubmit} onValidatedSubmit={handleValidatedSubmit}
    >
      <TextInput id={`${modalID}Name`}
        label="Template Name" type="text" value={nameInput.value} handleChange={nameInput.handleChange}
        editing={nameInput.editing} errors={errors["name"]}
      />
      <TextInput id={`${modalID}Upload`} ref={uploadInput.ref as React.RefObject<HTMLInputElement>}
        label="Upload" type="file" value={uploadInput.value} handleChange={uploadInput.handleChange}
        editing={uploadInput.editing} errors={errors["upload"]}
        accept=".doc,.docx,.xml,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      />
      <TextInput id={`${modalID}Description`}
        label="Description (optional)" type="textarea" value={descriptionInput.value}
        handleChange={descriptionInput.handleChange}
        editing={descriptionInput.editing} errors={errors["description"]} rows={3}         
      />
    </AddModal>
  )
};

export default AddTemplateModal;