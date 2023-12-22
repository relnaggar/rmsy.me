import React, { useId } from "react";

import InputWithSave from "../common/InputWithSave";
import EditModal, { EditResourceModalProps } from "../common/EditModal";
import { Status } from '../api/types';


interface EditColumnModalProps extends EditResourceModalProps<Status> {};

const EditColumnModal = ({
  show, setShow, editId,
  ...resourceManager
}: EditColumnModalProps): React.JSX.Element => {
  const modalId = useId();

  return (
    <EditModal title={"Edit Column"} modalId={modalId} show={show} setShow={setShow}>
      <InputWithSave editId={editId} {...resourceManager} 
        type="text" editableProperty="name" labelText="Column Name"
        required
      />
    </EditModal>
  );
};

export default EditColumnModal;