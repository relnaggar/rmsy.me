import React, { useContext, useState, useEffect } from "react";

import { FetchDataContext } from "../routes/routesConfig";

import DocumentList from "../common/DocumentList";
import { toFormData } from "../common/utilities";

import EditTemplateModal from "./EditTemplateModal";
import AddTemplateModal from "./AddTemplateModal";

import { ResumeTemplate, ResumeTemplateUpload } from "./types";


export default function ResumeTemplateList(): React.JSX.Element {  
  const fetchData = useContext(FetchDataContext);

  // get templates from server
  const [templates, setTemplates] = useState<ResumeTemplate[]>([]);
  const [templatesLoaded, setTemplatesLoaded] = useState<boolean>(false);  
  useEffect(() => {
    async function getTemplates(): Promise<void> {
      await fetchData("../api/templates/", { 
        method: "GET", 
        headers: { "Content-Type": "application/json" },
      })
      .then(response => response.json())
      .then(data => setTemplates(data))
      .catch(error => console.error("Error:", error))
      .finally(() => setTemplatesLoaded(true));
    }
    getTemplates();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // edit template
  const [showEditTemplateModal, setShowEditTemplateModal] = useState<boolean>(false);
  const [editTemplateID, setEditTemplateID] = useState<number>(-1);
  function handleClickEditTemplate(id: number): void {
    setEditTemplateID(id);
    setShowEditTemplateModal(true);    
  }

  // remove template
  const [removedTemplateId, setRemovedTemplateId] = useState<number>(-1);
  function removeTemplate(id: number): void {
    setTemplates(templates.filter((template) => template.id !== id));
    setRemovedTemplateId(id);
  }  
  useEffect(() => {
    async function deleteTemplate(): Promise<void> {
      await fetchData(`../api/templates/${removedTemplateId}/`, { 
        method: "DELETE", 
        headers: { "Content-Type": "application/json" },
      })
      .then((response) => response.status === 204 && setRemovedTemplateId(-1))
      .catch((error) => console.error("Error:", error));
    }
    if (removedTemplateId !== -1) {
      deleteTemplate();
    }
  }, [removedTemplateId]); // eslint-disable-line react-hooks/exhaustive-deps

  // add template
  const [showAddTemplateModal, setShowAddTemplateModal] = useState<boolean>(false);
  const [addedTemplate, setAddedTemplate] = useState<ResumeTemplateUpload | null>(null);
  function handleClickAddTemplate(): void {
    setShowAddTemplateModal(true);
  }
  function addTemplate(templateUpload: ResumeTemplateUpload): void {
    // add placeholder template to templates state
    const placeholderTemplate: ResumeTemplate = {
      id: -1,
      name: templateUpload.name,
      docx: "",
      png: "",
      description: templateUpload.description
    };
    setTemplates([...templates, placeholderTemplate]);

    // queue template to be added to server
    setAddedTemplate(templateUpload);
  }
  useEffect(() => {
    async function postTemplate(formData: FormData): Promise<void> {
      await fetchData("../api/templates/", { 
        method: "POST", 
        body: formData
      })
      .then((response) => response.json())
      .then((data) => {
        // replace placeholder template with template from server
        setTemplates([
          ...templates.filter((template) => template.id !== -1),
          data
        ]);
        // template has been added so set addedTemplate to null
        setAddedTemplate(null);
      })
      .catch((error) => console.error("Error:", error));
    }
    if (addedTemplate !== null) {
      postTemplate(toFormData(addedTemplate));
    }
  }, [addedTemplate]); // eslint-disable-line react-hooks/exhaustive-deps

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