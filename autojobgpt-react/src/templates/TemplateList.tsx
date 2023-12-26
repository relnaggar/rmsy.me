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
import { FillField, Template, TemplateUpload, TemplateType } from "../api/types";


const generatePlaceholderTemplate = (templateUpload: TemplateUpload): Template => {
  return {
    id: -1,
    name: templateUpload.name,
    docx: "",
    png: "",
    description: templateUpload.description,
    fillFields: [],
    type: templateUpload.type,
  };
};

interface TemplateListProps {
  templateType: TemplateType,
  templateTypeLabel: string,
}

const TemplateList = ({
  templateType,
  templateTypeLabel,
}: TemplateListProps): React.JSX.Element => {
  const openConfirmationModal = useContext(ConfirmationModalContext);
  const addTemplateModal = useAddModal();
  const editTemplateModal = useEditModal();
  const errorAlert = useErrorAlert();

  const fillFieldManager = useFetchResource<FillField>("fillFields/", { onFail: errorAlert.showErrors });
  const { resources: fillFields, setResources: setFillFields } = fillFieldManager;

  const handleAddTemplateSuccess = (template: Template) => {
    addTemplateModal.handleAddSuccess();
    setFillFields([...fillFields, ...template.fillFields]);
  };

  const templateManager = useResource<Template,TemplateUpload>(`templates/`, generatePlaceholderTemplate, {
    fetchParamString: `type=${templateType}`,
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
    openConfirmationModal(() => deleteTemplate(id), `delete ${templateTypeLabel} template "${template.name}"`, "Delete");
  };

  const handleClickAddTemplate = (_: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
    addTemplateModal.open();
  };

  return(
    <section>
      <h2 className="mb-3">{templateTypeLabel} Templates</h2>
      <ErrorAlert {...errorAlert} />
      <DocumentList {...templateManager}
        onClickEditDocument={handleClickEditTemplate}
        onClickRemoveDocument={handleClickRemoveTemplate}
        onClickAddDocument={handleClickAddTemplate}
        addButtonText={`Upload ${templateTypeLabel.toLowerCase()} template`}
      />
      <EditTemplateModal editId={editTemplateModal.editId}
        show={editTemplateModal.show}
        setShow={editTemplateModal.setShow}
        apiPath={templateManager.apiPath}
        resources={templateManager.resources}
        setResources={templateManager.setResources}
        fillFields={fillFieldManager.resources}
        setFillFields={fillFieldManager.setResources}
        templateTypeLabel={templateTypeLabel}
      />
      <AddTemplateModal {...addTemplateModal}
        postResource={templateManager.postResource}
        templateType={templateType}
        templateTypeLabel={templateTypeLabel}
      />
    </section>
  )
};

export default TemplateList;