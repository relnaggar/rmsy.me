import React, { useCallback, useId } from "react";

import useInputControl from "../hooks/useInputControl";
import useFetchResource from "../hooks/useFetchResource";
import AddModal, { AddResourceModalProps } from "../common/AddModal";
import SelectInputWithRefresh from "../common/SelectInputWithRefresh";
import { Job, Template, TailoredDocumentUpload, DocumentType } from '../api/types';


interface AddTailoredDocumentModalProps extends AddResourceModalProps<TailoredDocumentUpload> {
  documentType: DocumentType,
  documentTypeLabel: string,
}

const AddTailoredDocumentModal = ({  
  postResource: postTailoredDocument,
  documentType,
  documentTypeLabel,
  ...addModal
}: AddTailoredDocumentModalProps): React.JSX.Element => {
  const modalId = useId();
  const jobInput = useInputControl("");
  const templateInput = useInputControl("");

  const handleRefreshFail = useCallback((errors: Record<string, string[]>) => {
    addModal.setShowErrorAlert(true);
    addModal.setErrors(errors);
  }, [addModal]);

  const jobManager = useFetchResource<Job>("jobs/", {
    onFail: handleRefreshFail,
  });

  const templateManager = useFetchResource<Template>(`templates/?type=${documentType}`, {
    onFail: handleRefreshFail,
  });

  const validateSubmit = (): boolean => {
    if (jobInput.value === "" || templateInput.value === "") {
      const newErrors: Record<string, string[]> = {};
      if (jobInput.value === "") {
        newErrors["job"] = ["Job is required."];
      }
      if (templateInput.value === "") {
        newErrors["template"] = ["Template is required."];
      }
      addModal.setErrors(newErrors);
      jobInput.stopEditing();
      templateInput.stopEditing();
      return false;
    } else {
      return true;
    }
  }

  const handleValidatedSubmit = (): void => {
    postTailoredDocument({
      job: parseInt(jobInput.value),
      template: parseInt(templateInput.value),
      type: documentType,
    });
    jobInput.stopEditing();
    templateInput.stopEditing();
  };

  const handleEntered = (): void => {
    jobManager.refetch();
    templateManager.refetch();
  };

  return (
    <AddModal modalId={modalId} {...addModal} onEntered={handleEntered}
      title={`Generate ${documentTypeLabel}`} validateSubmit={validateSubmit} onValidatedSubmit={handleValidatedSubmit}
    >
      <SelectInputWithRefresh {...jobManager}
        value={jobInput.value} editing={jobInput.editing} handleChange={jobInput.handleChange}
        label="Job" optionToString={(job) => `${job.title}, ${job.company}`} errors={addModal.errors["job"]}
      />
      <SelectInputWithRefresh {...templateManager}
        value={templateInput.value} editing={templateInput.editing} handleChange={templateInput.handleChange}
        label={`${documentTypeLabel} Template`} optionToString={(template) => template.name} errors={addModal.errors["template"]}
      />
    </AddModal>
  );
};

export default AddTailoredDocumentModal;