import React, { useContext, useState } from "react";

import { ConfirmationModalContext } from "../routes/Layout";
import useResource from "../hooks/useResource";
import DocumentList from "../common/DocumentList";
import EditTemplateModal from "./EditTemplateModal";
import AddTemplateModal from "./AddTemplateModal";
import { ResumeTemplate, ResumeTemplateUpload } from "../templates/types";


export default function ResumeTemplateList(): React.JSX.Element {
  const {
    setShow: setShowConfirmationModal,
    setAction: setConfirmationAction,
    setActionDescription: setConfirmationActionDescription,
    setActionVerb: setConfirmationActionVerb,
  } = useContext(ConfirmationModalContext);

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
    loaded: templatesLoaded,
    removeResource: removeTemplate,
    removedID: templateBeingRemovedID,
    addResource: addTemplate,
    errors: { fetchError, deleteError, postError },
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
      setConfirmationAction(() => () => removeTemplate(id));
      const template: ResumeTemplate = templates.find((template) => template.id === id)!;
      setConfirmationActionDescription(`delete resume template "${template.name}"`);
      setConfirmationActionVerb("Delete");
      setShowConfirmationModal(true);      
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
        documentsLoaded={templatesLoaded}
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