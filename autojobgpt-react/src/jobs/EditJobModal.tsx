import React, { useId } from "react";

import EditModal, { EditResourceModalProps } from "../common/EditModal";
import InputWithSave from "../common/InputWithSave";
import { Status, Job, Resume } from '../api/types';


interface EditJobModalProps extends EditResourceModalProps<Job> {
  statuses: Status[],
  resumes: Resume[],
};

const EditJobModal = ({
  show, setShow, editId,
  statuses,
  resumes,
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
        type="select" editableProperty="chosen_resume" labelText="Chosen Resume" defaultOptionLabel="None"
        selectOptions={resumes
          .filter((resume: Resume) => resume.job.id === editId)
          .map((resume: Resume) => {
            return { value: resume.id.toString(), label: resume.name };
          })
        }
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