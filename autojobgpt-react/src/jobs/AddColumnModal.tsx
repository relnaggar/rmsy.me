import React, { useId } from "react";

import useInputControl from "../hooks/useInputControl";
import AddModal, { AddResourceModalProps } from "../common/AddModal";
import BaseInput from "../common/BaseInput";
import { StatusUpload } from '../api/types';


const AddColumnModal = ({
  postResource: postColumn,
  ...addColumnModal
}: AddResourceModalProps<StatusUpload>): React.JSX.Element => {
  const modalId = useId();
  const nameInput = useInputControl("name");
  
  const validateSubmit = (): boolean => {
    let valid = true;
    const newErrors: Record<string,string[]> = {};

    if (nameInput.value === "") {
      newErrors[nameInput.name] = ["Column name is required."];
      valid = false;
    }

    addColumnModal.setErrors(newErrors);
    nameInput.stopEditing();

    return valid;
  };

  const handleValidatedSubmit = (): void => {
    postColumn({ name: nameInput.value });
  };

  return (
    <AddModal
      {...addColumnModal} errors={{
        error: addColumnModal.errors["error"],
        non_field_errors: addColumnModal.errors["non_field_errors"],
        detail: addColumnModal.errors["detail"],
      }}
      title="Add Column" modalId={modalId}
      validateSubmit={validateSubmit} onValidatedSubmit={handleValidatedSubmit}
    >
      <BaseInput ref={nameInput.ref} name={nameInput.name}
        value={nameInput.value} editing={nameInput.editing} handleChange={nameInput.handleChange}
        label="Name" type="text" errors={addColumnModal.errors[nameInput.name]}
      />
    </AddModal>
  );
};

export default AddColumnModal;