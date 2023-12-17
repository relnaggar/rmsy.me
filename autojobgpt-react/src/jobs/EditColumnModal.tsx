import React from "react";

import InputWithSave from "../common/InputWithSave";
import EditModal, { EditResourceModalProps } from "../common/EditModal";
import { Status } from '../api/types';


interface EditColumnModalProps extends EditResourceModalProps<Status> {};

const EditColumnModal = ({
  apiPath, show, setShow, resourceId, resources, setResources,
}: EditColumnModalProps): React.JSX.Element => {
  const modalId = `editColumnModal${resourceId}`;
  const title = "Edit Column";

  return (
    <EditModal title={title} modalId={modalId} show={show} setShow={setShow}>
      <InputWithSave id={resourceId}
        type="text"
        apiPath={apiPath}
        resources={resources}
        setResources={setResources}          
        editableProperty="name"
        labelText="Column Name"
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