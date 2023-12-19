import React from "react";

import InputWithSave from "../common/InputWithSave";
import EditModal, { EditResourceModalProps } from "../common/EditModal";
import { Status } from '../api/types';


interface EditColumnModalProps extends EditResourceModalProps<Status> {};

const EditColumnModal = ({
  show, setShow, editId,
  ...resourceManager
}: EditColumnModalProps): React.JSX.Element => {
  const modalId = `editColumnModal${editId}`;
  const title = "Edit Column";

  return (
    <EditModal title={title} modalId={modalId} show={show} setShow={setShow}>
      <InputWithSave editId={editId} {...resourceManager}
        type="text" editableProperty="name" labelText="Column Name"
        validateSubmit={(value: string) => {
          const errors: Record<string,string[]> = {};
          if (value === "") {
            errors["name"] = ["Please enter a column name."];
          }
          return errors;
        }}
      />
    </EditModal>
  );
};

export default EditColumnModal;