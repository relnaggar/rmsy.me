import React from "react";

import useFormInput from "../hooks/useFormInput";
import AddModal from "../common/AddModal";
import FormInput from "../common/FormInput";
import { StatusUpload } from "./types";
import { ModalProps } from "../common/types";


interface AddColumnModalProps extends ModalProps {
  addColumn: (statusUpload: StatusUpload) => void,
};

const AddColumnModal = ({
  show, setShow, errors, setErrors, showErrorAlert, setShowErrorAlert,
  addColumn,
}: AddColumnModalProps): React.JSX.Element => {
  const modalID = "addColumnModal";
  const nameInput = useFormInput();
  
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

  const handleSuccessfulSubmit = (): void => {
    addColumn({ name: nameInput.value });
  };

  return (
    <AddModal
      show={show} setShow={setShow} errors={{error: errors["error"]}} setErrors={setErrors}
      showErrorAlert={showErrorAlert} setShowErrorAlert={setShowErrorAlert}
      title="Add Column" modalID={modalID}
      validateSubmit={validateSubmit} onSuccessfulSubmit={handleSuccessfulSubmit}
    >
      <FormInput id={`${modalID}Name`}
        label="Name" type="text" value={nameInput.value} handleChange={nameInput.handleChange}
        editing={nameInput.editing} error={errors["name"]}
      />
    </AddModal>
  );
};

export default AddColumnModal;