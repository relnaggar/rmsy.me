import React, { useCallback, useContext, useState } from "react";
import Alert from 'react-bootstrap/Alert';

import { ConfirmationModalContext } from "../routes/Layout";
import useResource from "../hooks/useResource";
import useFetch from "../hooks/useFetch";
import DocumentList from "../common/DocumentList";
import EditTemplateModal from "./EditTemplateModal";
import AddTemplateModal from "./AddTemplateModal";
import { ResumeTemplate, ResumeTemplateUpload, FillField } from "../templates/types";


export default function ResumeTemplateList(): React.JSX.Element {
  const openConfirmationModal = useContext(ConfirmationModalContext);

  const [errorMessage, setErrorMessage] = useState<string>("");
  const [showErrorAlert, setShowErrorAlert] = useState<boolean>(false);

  const handleErrors = useCallback((errors: Record<string,string>) => {
    setErrorMessage(Object.values(errors).join(" "));
    setShowErrorAlert(true);    
  }, []);

  const {
    resource: fillFields,
    setResource: setFillFields
  } = useFetch<FillField[]>("fillfields/", { initialResource: [], onFail: handleErrors });


  const [addTemplateErrors, setAddTemplateErrors] = useState<Record<string,string>>({});  
  const [showAddTemplateErrorAlert, setShowAddTemplateErrorAlert] = useState<boolean>(false);

  const handleAddTemplateSuccess = useCallback((template: ResumeTemplate) => {
    setFillFields([...fillFields, ...template.fillFields]);
  }, [fillFields, setFillFields]);

  const handleAddTemplateFail = useCallback((errors: Record<string,string>) => {
    setAddTemplateErrors(errors);
    setShowAddTemplateModal(true);
    if (errors["error"]) {
      setShowAddTemplateErrorAlert(true);
    }
  }, []);

  function getPlaceholderTemplate(templateUpload: ResumeTemplateUpload): ResumeTemplate {
    return {
      id: -1,
      name: templateUpload.name,
      docx: "",
      png: "",
      description: templateUpload.description,
      fillFields: [],
    };
  };
  const templateAPIPath: string = "templates/";
  const {
    resources: templates,
    setResources: setTemplates,
    fetching: loadingTemplates,
    posting: addingTemplate,
    postResource: addTemplate,
    deleteResource: removeTemplate,
    idBeingDeleted: templateBeingRemovedID,    
  } = useResource<ResumeTemplate,ResumeTemplateUpload>(templateAPIPath, getPlaceholderTemplate, {
    onFetchFail: handleErrors,
    onPostSuccess: handleAddTemplateSuccess,
    onPostFail: handleAddTemplateFail,
    onDeleteFail: handleErrors,
  });

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
      { showErrorAlert &&
        <Alert variant="danger" onClose={() => setShowErrorAlert(false)} dismissible>
          {errorMessage}
        </Alert>
      }
      <DocumentList
        documents={templates}
        loadingDocuments={loadingTemplates}
        onClickEditDocument={handleClickEditTemplate}
        onClickRemoveDocument={handleClickRemoveResume}
        documentBeingRemovedID={templateBeingRemovedID}
        onClickAddDocument={handleClickAddTemplate}
        addButtonText="Upload resume template"
        addDisabled={addingTemplate}
      />
      <EditTemplateModal
        apiPath={templateAPIPath}
        show={showEditTemplateModal}
        setShow={setShowEditTemplateModal}
        templateID={editTemplateID}
        templates={templates}
        setTemplates={setTemplates}
        fillFields={fillFields}
        setFillFields={setFillFields}
      />
      <AddTemplateModal
        show={showAddTemplateModal}
        setShow={setShowAddTemplateModal}
        onSubmitAddTemplate={addTemplate}
        errors={addTemplateErrors}
        showErrorAlert={showAddTemplateErrorAlert}
        setShowErrorAlert={setShowAddTemplateErrorAlert}
      />
    </section>
  )
}