import React from "react";

import useFormInput from "../hooks/useFormInput";
import AddModal from "../common/AddModal";
import FormInput from "../common/FormInput";
import { ResumeTemplateUpload } from "../templates/types";
import { ModalProps } from "../common/types";


interface AddTemplateModalProps extends ModalProps {
  addTemplate: (template: ResumeTemplateUpload) => void,
};

const AddTemplateModal: (props: AddTemplateModalProps) => React.JSX.Element = ({
  show, setShow, errors, setErrors, showErrorAlert, setShowErrorAlert,
  addTemplate,
}) => {
  const nameInput = useFormInput();
  const uploadInput = useFormInput();
  const descriptionInput = useFormInput();

  const modalID: string = `addTemplateModal`;

  const handleSuccessfulSubmit = (): void => {
    const docx: File = (document.getElementById(`${modalID}Upload`) as HTMLInputElement).files![0];
    addTemplate({ name: nameInput.value, docx, description: descriptionInput.value });

    for (const input of [nameInput, uploadInput, descriptionInput]) {
      input.stopEditing();
    }
  };

  return (
    <AddModal
      show={show} setShow={setShow} errors={{error: errors["error"]}} setErrors={setErrors}
      showErrorAlert={showErrorAlert} setShowErrorAlert={setShowErrorAlert}
      title="Add Resume Template" modalID={modalID}
      onSuccessfulSubmit={handleSuccessfulSubmit}
    >
      <FormInput id={`${modalID}Name`}
        label="Template Name" type="text" value={nameInput.value} handleChange={nameInput.handleChange}
        editing={nameInput.editing} error={errors["name"]} required
      />
      <FormInput id={`${modalID}Upload`}
        label="Upload" type="file" value={uploadInput.value} handleChange={uploadInput.handleChange}
        editing={uploadInput.editing} error={errors["upload"]} required
        accept=".doc,.docx,.xml,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      />
      <FormInput id={`${modalID}Description`}
        label="Description (optional)" type="textarea" value={descriptionInput.value}
        handleChange={descriptionInput.handleChange}
        editing={descriptionInput.editing} error={errors["description"]} rows={3}         
      />
    </AddModal>
  )
};

export default AddTemplateModal;