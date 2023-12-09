import React from "react";

import useInputControl from "../hooks/useInputControl";
import AddModal, { ModalProps } from "../common/AddModal";
import TextInput from "../common/TextInput";
import { StatusUpload } from '../api/types';


interface AddColumnModalProps extends ModalProps {
  addColumn: (statusUpload: StatusUpload) => void,
};

const AddColumnModal = ({
  show, setShow, errors, setErrors, showErrorAlert, setShowErrorAlert,
  addColumn,
}: AddColumnModalProps): React.JSX.Element => {
  const modalId = "addColumnModal";
  const nameInput = useInputControl();
  
  const validateSubmit = (): boolean => {
    let valid = true;
    const newErrors: Record<string,string[]> = {};

    if (nameInput.value === "") {
      newErrors["name"] = ["Please enter a column name."];
      valid = false;
    }

    setErrors(newErrors);
    nameInput.stopEditing();

    return valid;
  };

  const handleValidatedSubmit = (): void => {
    addColumn({ name: nameInput.value });
  };

  return (
    <AddModal
      show={show} setShow={setShow} errors={{error: errors["error"]}} setErrors={setErrors}
      showErrorAlert={showErrorAlert} setShowErrorAlert={setShowErrorAlert}
      title="Add Column" modalId={modalId}
      validateSubmit={validateSubmit} onValidatedSubmit={handleValidatedSubmit}
    >
      <TextInput id={`${modalId}Name`}
        label="Name" type="text" value={nameInput.value} handleChange={nameInput.handleChange}
        editing={nameInput.editing} errors={errors["name"]}
      />
    </AddModal>
  );
};

export default AddColumnModal;