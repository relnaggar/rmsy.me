import React, { useContext, useState } from "react";

import { ConfirmationModalContext } from "../routes/Layout";
import useResource from "../hooks/useResource";
import DocumentList from "../common/DocumentList";
import EditTemplateModal from "./EditTemplateModal";
import AddTemplateModal from "./AddTemplateModal";
import { ResumeTemplate, ResumeTemplateUpload } from "../templates/types";


export default function ResumeTemplateList(): React.JSX.Element {
  const openConfirmationModal = useContext(ConfirmationModalContext);

  function getPlaceholderTemplate(templateUpload: ResumeTemplateUpload): ResumeTemplate {
    return {
      id: -1,
      name: templateUpload.name,
      docx: "",
      png: "",
      description: templateUpload.description
    };
  };
  const templateAPIPath: string = "templates/";
  const {
    resources: templates,
    setResources: setTemplates,
    fetching: loadingTemplates,
    deleteResource: removeTemplate,
    idBeingDeleted: templateBeingRemovedID,
    postResource: addTemplate,
  } = useResource<ResumeTemplate,ResumeTemplateUpload>(templateAPIPath, getPlaceholderTemplate);

  const [showEditTemplateModal, setShowEditTemplateModal] = useState<boolean>(false);
  const [editTemplateID, setEditTemplateID] = useState<number>(-1);
  const [showAddTemplateModal, setShowAddTemplateModal] = useState<boolean>(false);

  function handleClickEditTemplate(id: number): (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void {
    return (_: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      setEditTemplateID(id);
      setShowEditTemplateModal(true);
    };
  }  

  function handleClickRemoveResume(id: number): (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void {    
    return (_: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      const template: ResumeTemplate = templates.find((template) => template.id === id)!;
      openConfirmationModal(() => removeTemplate(id), `delete resume template "${template.name}"`, "Delete");
    };
  }
  
  function handleClickAddTemplate(_: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
    setShowAddTemplateModal(true);
  }

  return(
    <section>
      <h2>Templates</h2>
      <DocumentList
        documents={templates}
        loadingDocuments={loadingTemplates}
        onClickEditDocument={handleClickEditTemplate}
        onClickRemoveDocument={handleClickRemoveResume}
        documentBeingRemovedID={templateBeingRemovedID}
        onClickAddDocument={handleClickAddTemplate}
        addButtonText="Upload resume template"
      />
      <EditTemplateModal
        apiPath={templateAPIPath}
        show={showEditTemplateModal}
        setShow={setShowEditTemplateModal}
        templateID={editTemplateID}
        templates={templates}
        setTemplates={setTemplates}
      />
      <AddTemplateModal
        show={showAddTemplateModal}
        setShow={setShowAddTemplateModal}
        onSubmitAddTemplate={addTemplate}
      />
    </section>
  )
}