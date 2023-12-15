import React, { useCallback, useContext } from "react";

import { ConfirmationModalContext } from "../routes/Layout";
import useAddModal from "../hooks/useAddModal";
import useEditModal from "../hooks/useEditModal";
import useErrorAlert from "../hooks/useErrorAlert";
import useFetchResource from "../hooks/useFetchResource";
import useResource from "../hooks/useResource";
import ErrorAlert from "../common/ErrorAlert";
import DocumentList from "../common/DocumentList";
import EditTemplateModal from "./EditTemplateModal";
import AddTemplateModal from "./AddTemplateModal";
import { FillField, ResumeTemplate, ResumeTemplateUpload } from "../api/types";


const generatePlaceholderTemplate = (templateUpload: ResumeTemplateUpload): ResumeTemplate => {
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
  const editTemplateModal = useEditModal();
  const errorAlert = useErrorAlert();

  const fillFieldManager = useFetchResource<FillField>("fillFields/", { onFail: errorAlert.showErrors });
  const { resources: fillFields, setResources: setFillFields } = fillFieldManager;

  const handleAddTemplateSuccess = useCallback((template: ResumeTemplate) => {
    addTemplateModal.handleAddSuccess();
    setFillFields([...fillFields, ...template.fillFields]);
  }, [addTemplateModal, fillFields, setFillFields]);

  const templateManager = useResource<ResumeTemplate,ResumeTemplateUpload>("templates/", generatePlaceholderTemplate, {
    onFetchFail: errorAlert.showErrors,
    onPostSuccess: handleAddTemplateSuccess,
    onPostFail: addTemplateModal.handleAddFail,
    onDeleteFail: errorAlert.showErrors,
  });
  const { resources: templates, deleteResource: deleteTemplate } = templateManager;

  const handleClickEditTemplate = (id: number) => (_: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
    editTemplateModal.open(id);
  };

  const handleClickRemoveTemplate = (id: number) => (_: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
    const template: ResumeTemplate = templates.find((template) => template.id === id)!;
    openConfirmationModal(() => deleteTemplate(id), `delete resume template "${template.name}"`, "Delete");
  };

  const handleClickAddTemplate = (_: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
    addTemplateModal.open();
  };

  return(
    <section>
      <h2>Templates</h2>
      <ErrorAlert {...errorAlert} />
      <DocumentList
        onClickEditDocument={handleClickEditTemplate}
        onClickRemoveDocument={handleClickRemoveTemplate}
        onClickAddDocument={handleClickAddTemplate}
        addButtonText="Upload resume template"
        {...templateManager}
      />
      <EditTemplateModal
        apiPath={templateManager.apiPath}
        templates={templateManager.resources}
        setTemplates={templateManager.setResources}
        show={editTemplateModal.show}
        setShow={editTemplateModal.setShow}
        templateId={editTemplateModal.editId}        
        fillFields={fillFieldManager.resources}
        setFillFields={fillFieldManager.setResources}
      />
      <AddTemplateModal postResource={templateManager.postResource} {...addTemplateModal} />
    </section>
  )
};

export default ResumeTemplateList;