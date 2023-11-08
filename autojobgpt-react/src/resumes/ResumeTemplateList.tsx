import React, { useState } from "react";

import useResource from "../hooks/useResource";
import EditTemplateModal from "./EditTemplateModal";
import AddTemplateModal from "./AddTemplateModal";
import DocumentList from "../common/DocumentList";
import { ResumeTemplate, ResumeTemplateUpload } from "./types";


export default function ResumeTemplateList(): React.JSX.Element {
  function getPlaceholderTemplate(templateUpload: ResumeTemplateUpload): ResumeTemplate {
    return {
      id: -1,
      name: templateUpload.name,
      docx: "",
      png: "",
      description: templateUpload.description
    };
  };
  const {
    resources: templates,
    loaded: templatesLoaded,
    removeResource: removeTemplate,
    addResource: addTemplate,
    errors
  } = useResource<ResumeTemplate,ResumeTemplateUpload>("../api/templates/", getPlaceholderTemplate);

  const [showEditTemplateModal, setShowEditTemplateModal] = useState<boolean>(false);
  const [editTemplateID, setEditTemplateID] = useState<number>(-1);
  const [showAddTemplateModal, setShowAddTemplateModal] = useState<boolean>(false);

  function handleClickEditTemplate(id: number): void {
    setEditTemplateID(id);
    setShowEditTemplateModal(true);    
  }  
  
  function handleClickAddTemplate(): void {
    setShowAddTemplateModal(true);
  }

  return(
    <section>
      <h2>Templates</h2>
      <DocumentList
        documents={templates}
        documentsLoaded={templatesLoaded}
        onClickEditDocument={handleClickEditTemplate}
        onClickRemoveDocument={removeTemplate}
        onClickAddDocument={handleClickAddTemplate}
        addButtonText="Upload resume template"
      />
      <EditTemplateModal show={showEditTemplateModal} setShow={setShowEditTemplateModal} id={editTemplateID} />
      <AddTemplateModal show={showAddTemplateModal} setShow={setShowAddTemplateModal} onSubmitAddTemplate={addTemplate} />
    </section>
  )
}