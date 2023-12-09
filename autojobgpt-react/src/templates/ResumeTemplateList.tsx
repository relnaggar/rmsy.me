import React, { useCallback, useContext, useState } from "react";
import BoostrapAlert from 'react-bootstrap/Alert';

import { ConfirmationModalContext } from "../routes/Layout";
import useResource from "../hooks/useResource";
import useFetch from "../hooks/useFetch";
import DocumentList from "../common/DocumentList";
import EditTemplateModal from "./EditTemplateModal";
import AddTemplateModal from "./AddTemplateModal";
import { FillField, ResumeTemplate, ResumeTemplateUpload } from "../api/types";


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

  const [errorMessage, setErrorMessage] = useState<string>("");
  const [showErrorAlert, setShowErrorAlert] = useState<boolean>(false);

  const handleErrors = useCallback((errors: Record<string,string[]>) => {
    setErrorMessage(Object.values(errors).join(" "));
    setShowErrorAlert(true);    
  }, []);

  const {
    resource: fillFields,
    setResource: setFillFields
  } = useFetch<FillField[]>("fillFields/", { initialResource: [], onFail: handleErrors });


  const [addTemplateErrors, setAddTemplateErrors] = useState<Record<string,string[]>>({});  
  const [showAddTemplateErrorAlert, setShowAddTemplateErrorAlert] = useState<boolean>(false);

  const handleAddTemplateSuccess = useCallback((template: ResumeTemplate) => {
    setFillFields([...fillFields, ...template.fillFields]);
  }, [fillFields, setFillFields]);

  const handleAddTemplateFail = useCallback((errors: Record<string,string[]>) => {
    setAddTemplateErrors(errors);
    setShowAddTemplateModal(true);
    if (errors["error"]) {
      setShowAddTemplateErrorAlert(true);
    }
  }, []);

  const templateAPIPath: string = "templates/";
  const {
    resources: templates,
    setResources: setTemplates,
    fetching: loadingTemplates,
    posting: addingTemplate,
    postResource: addTemplate,
    deleteResource: removeTemplate,
    idBeingDeleted: templateBeingRemovedId,    
  } = useResource<ResumeTemplate,ResumeTemplateUpload>(templateAPIPath, getPlaceholderTemplate, {
    onFetchFail: handleErrors,
    onPostSuccess: handleAddTemplateSuccess,
    onPostFail: handleAddTemplateFail,
    onDeleteFail: handleErrors,
  });

  const [showEditTemplateModal, setShowEditTemplateModal] = useState<boolean>(false);
  const [editTemplateId, setEditTemplateId] = useState<number>(-1);
  const [showAddTemplateModal, setShowAddTemplateModal] = useState<boolean>(false);

  const handleClickEditTemplate = (id: number) => (_: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
    setEditTemplateId(id);
    setShowEditTemplateModal(true);
  }  

  const handleClickRemoveResume = (id: number) => (_: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
    const template: ResumeTemplate = templates.find((template) => template.id === id)!;
    openConfirmationModal(() => removeTemplate(id), `delete resume template "${template.name}"`, "Delete");
  };
  
  const handleClickAddTemplate = (_: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
    setShowAddTemplateModal(true);
  };

  return(
    <section>
      <h2>Templates</h2>
      { showErrorAlert &&
        <BoostrapAlert variant="danger" onClose={() => setShowErrorAlert(false)} dismissible>
          {errorMessage}
        </BoostrapAlert>
      }
      <DocumentList
        documents={templates}
        loadingDocuments={loadingTemplates}
        onClickEditDocument={handleClickEditTemplate}
        onClickRemoveDocument={handleClickRemoveResume}
        documentBeingRemovedId={templateBeingRemovedId}
        onClickAddDocument={handleClickAddTemplate}
        addButtonText="Upload resume template"
        addDisabled={addingTemplate}
      />
      <EditTemplateModal
        apiPath={templateAPIPath}
        show={showEditTemplateModal}
        setShow={setShowEditTemplateModal}
        templateId={editTemplateId}
        templates={templates}
        setTemplates={setTemplates}
        fillFields={fillFields}
        setFillFields={setFillFields}
      />
      <AddTemplateModal
        show={showAddTemplateModal} setShow={setShowAddTemplateModal}
        errors={addTemplateErrors} setErrors={setAddTemplateErrors}
        showErrorAlert={showAddTemplateErrorAlert} setShowErrorAlert={setShowAddTemplateErrorAlert}
        addTemplate={addTemplate}
      />
    </section>
  )
};

export default ResumeTemplateList;