import React from "react";

import useFormInput from "../hooks/useFormInput";
import AddModal from "../common/AddModal";
import FormInput from "../common/FormInput";
import { StatusUpload } from "./types";
import { ModalProps } from "../common/types";


interface AddColumnModalProps extends ModalProps {
  addColumn: (statusUpload: StatusUpload) => void,
};

const AddColumnModal: (props: AddColumnModalProps) => React.JSX.Element = ({
  show, setShow, errors, setErrors, showErrorAlert, setShowErrorAlert,
  addColumn,
}) => {
  const modalID = "addColumnModal";
  const nameInput = useFormInput();  

  const handleSuccessfulSubmit = (): void => {
    addColumn({ name: nameInput.value });
    nameInput.stopEditing();
  };

  return (
    <AddModal
      show={show} setShow={setShow} errors={{error: errors["error"]}} setErrors={setErrors}
      showErrorAlert={showErrorAlert} setShowErrorAlert={setShowErrorAlert}
      title="Add Column" modalID={modalID}
      onSuccessfulSubmit={handleSuccessfulSubmit}
    >
      <FormInput id={`${modalID}Name`}
        label="Column Name" type="text" value={nameInput.value} handleChange={nameInput.handleChange}
        editing={nameInput.editing} error={errors["name"]} required
      />
    </AddModal>
  );
};

export default AddColumnModal;