import React, { useContext } from "react";

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
import { FillField, Template, TemplateUpload } from "../api/types";
import { DocumentsPageProps } from "../routes/DocumentsPage";


const generatePlaceholderTemplate = (templateUpload: TemplateUpload): Template => {
  return {
    id: -1,
    name: templateUpload.name,
    docx: "",
    png: "",
    additional_information: templateUpload.additional_information,
    fill_fields: [],
    type: templateUpload.type,
    paragraphs: [],
  };
};

const TemplateList = ({
  documentType,
  documentTypeLabel,
}: DocumentsPageProps): React.JSX.Element => {
  const openConfirmationModal = useContext(ConfirmationModalContext);
  const addTemplateModal = useAddModal();
  const editTemplateModal = useEditModal();
  const errorAlert = useErrorAlert();

  const fillFieldManager = useFetchResource<FillField>("fillFields/", { onFail: errorAlert.showErrors });
  const { resources: fillFields, setResources: setFillFields } = fillFieldManager;

  const handleAddTemplateSuccess = (template: Template) => {
    addTemplateModal.handleAddSuccess();
    setFillFields([...fillFields, ...template.fill_fields]);
  };

  const templateManager = useResource<Template,TemplateUpload>(`templates/`, generatePlaceholderTemplate, {
    fetchParamString: `type=${documentType}`,
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
    const template: Template = templates.find((template) => template.id === id)!;
    openConfirmationModal(() => deleteTemplate(id), `delete ${documentTypeLabel} template "${template.name}"`, "Delete");
  };

  const handleClickAddTemplate = (_: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
    addTemplateModal.open();
  };

  return(
    <section>
      <h2 className="mb-3">{documentTypeLabel} Templates</h2>
      <ErrorAlert {...errorAlert} />
      <DocumentList {...templateManager}
        onClickEditDocument={handleClickEditTemplate}
        onClickRemoveDocument={handleClickRemoveTemplate}
        onClickAddDocument={handleClickAddTemplate}
        addButtonText={`Upload ${documentTypeLabel.toLowerCase()} template`}
      />
      <EditTemplateModal editId={editTemplateModal.editId}
        show={editTemplateModal.show}
        setShow={editTemplateModal.setShow}
        apiPath={templateManager.apiPath}
        resources={templateManager.resources}
        setResources={templateManager.setResources}
        fillFields={fillFieldManager.resources}
        setFillFields={fillFieldManager.setResources}
        documentTypeLabel={documentTypeLabel}
      />
      <AddTemplateModal {...addTemplateModal}
        postResource={templateManager.postResource}
        documentType={documentType}
        documentTypeLabel={documentTypeLabel}
      />
    </section>
  )
};

export default TemplateList;