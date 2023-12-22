import React, { useId } from "react";

import EditModal, { EditResourceModalProps } from "../common/EditModal";
import InputWithSave from "../common/InputWithSave";
import { Status, Job } from '../api/types';


interface EditJobModalProps extends EditResourceModalProps<Job> {
  statuses: Status[],
};

const EditJobModal = ({
  show, setShow, editId,
  statuses,
  ...resourceManager
}: EditJobModalProps): React.JSX.Element => {
  const modalId = useId();

  return (
    <EditModal title={"Edit Job"} modalId={modalId} show={show} setShow={setShow} size="lg">
      <InputWithSave editId={editId} {...resourceManager}
        type="select" editableProperty="status" labelText="Status"
        selectOptions={statuses.map((status: Status) => {
          return { value: status.id.toString(), label: status.name };
        })}
        required
      />
      <InputWithSave editId={editId} {...resourceManager}
        type="url" editableProperty="url" labelText="URL"
      />
      <InputWithSave editId={editId} {...resourceManager}
        type="text" editableProperty="title" labelText="Title"
        required
      />
      <InputWithSave editId={editId} {...resourceManager}
        type="text" editableProperty="company" labelText="Company"
        required
      />
      <InputWithSave editId={editId} {...resourceManager}
        type="textarea" editableProperty="posting" labelText="Posting"
        required
      />
    </EditModal>
  );
};

export default EditJobModal;