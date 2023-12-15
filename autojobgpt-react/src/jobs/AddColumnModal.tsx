import React from "react";

import useInputControl, { InputControlMixin } from "../hooks/useInputControl";
import AddModal, { AddModalMixin } from "../common/AddModal";
import TextInput from "../common/TextInput";
import { StatusUpload } from '../api/types';


interface AddColumnModalProps extends AddModalMixin {
  addColumn: (statusUpload: StatusUpload) => void,
};

const AddColumnModal = ({  
  addColumn,
  ...addColumnModal
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

    addColumnModal.setErrors(newErrors);
    nameInput.stopEditing();

    return valid;
  };

  const handleValidatedSubmit = (): void => {
    addColumn({ name: nameInput.value });
  };

  return (
    <AddModal
      {...addColumnModal} errors={{error: addColumnModal.errors["error"]}} 
      title="Add Column" modalId={modalId}
      validateSubmit={validateSubmit} onValidatedSubmit={handleValidatedSubmit}
    >
      <TextInput id={`${modalId}Name`} {...nameInput as InputControlMixin}
        label="Name" type="text" errors={addColumnModal.errors["name"]}
      />
    </AddModal>
  );
};

export default AddColumnModal;