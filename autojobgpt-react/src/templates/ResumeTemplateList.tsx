import React, { useCallback, useContext, useState } from "react";

import { ConfirmationModalContext } from "../routes/Layout";
import useResource from "../hooks/useResource";
import useFetchResource from "../hooks/useFetchResource";
import useAddModal from "../hooks/useAddModal";
import DocumentList from "../common/DocumentList";
import EditTemplateModal from "./EditTemplateModal";
import AddTemplateModal from "./AddTemplateModal";
import { FillField, ResumeTemplate, ResumeTemplateUpload } from "../api/types";
import useErrorAlert from "../hooks/useErrorAlert";
import ErrorAlert from "../common/ErrorAlert";


export const getPlaceholderTemplate = (templateUpload: ResumeTemplateUpload): ResumeTemplate => {
  return {
    id: -1,
    name: templateUpload.name,
    docx: "",
    png: "",
    description: templateUpload.description,
    fillFields: [],
  };
};

const ResumeTemplateList = (): React.JSX.Element => {
  const openConfirmationModal = useContext(ConfirmationModalContext);
  const addTemplateModal = useAddModal();
  const errorAlert = useErrorAlert();

  const fillFields = useFetchResource<FillField>("fillFields/", { onFail: errorAlert.showErrors });

  const handleAddTemplateSuccess = useCallback((template: ResumeTemplate) => {
    addTemplateModal.handleAddSuccess();
    fillFields.setResources([...fillFields.resources, ...template.fillFields]);
  }, [addTemplateModal, fillFields]);

  const templates = useResource<ResumeTemplate,ResumeTemplateUpload>("templates/", getPlaceholderTemplate, {
    onFetchFail: errorAlert.showErrors,
    onPostSuccess: handleAddTemplateSuccess,
    onPostFail: addTemplateModal.handleAddFail,
    onDeleteFail: errorAlert.showErrors,
  });

  const [showEditTemplateModal, setShowEditTemplateModal] = useState<boolean>(false);
  const [editTemplateId, setEditTemplateId] = useState<number>(-1);

  const handleClickEditTemplate = (id: number) => (_: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
    setEditTemplateId(id);
    setShowEditTemplateModal(true);
  }  

  const handleClickRemoveResume = (id: number) => (_: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
    const template: ResumeTemplate = templates.resources.find((template) => template.id === id)!;
    openConfirmationModal(() => templates.deleteResource(id), `delete resume template "${template.name}"`, "Delete");
  };

  return(
    <section>
      <h2>Templates</h2>
      <ErrorAlert {...errorAlert} />
      <DocumentList
        documents={templates.resources}
        loadingDocuments={templates.fetching}
        onClickEditDocument={handleClickEditTemplate}
        onClickRemoveDocument={handleClickRemoveResume}
        documentBeingRemovedId={templates.idBeingDeleted}
        onClickAddDocument={addTemplateModal.open}
        addButtonText="Upload resume template"
        addDisabled={templates.posting}
      />
      <EditTemplateModal
        apiPath={templates.apiPath}
        show={showEditTemplateModal}
        setShow={setShowEditTemplateModal}
        templateId={editTemplateId}
        templates={templates.resources}
        setTemplates={templates.setResources}
        fillFields={fillFields.resources}
        setFillFields={fillFields.setResources}
      />
      <AddTemplateModal {...addTemplateModal} addTemplate={templates.postResource} />
    </section>
  )
};

export default ResumeTemplateList;