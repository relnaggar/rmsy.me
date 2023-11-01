import React, { useEffect, useState } from "react";

import DocumentList from "../common/DocumentList";
import { RemoveDocumentContext } from "../common/DocumentThumbnail";
import { ModalContext } from "../common/AddDocument";
import { toFormData } from "../common/utilities";
import { ResumeTemplate, ResumeTemplateUpload } from "./types";


export default function ResumeTemplateList({ fetchData, templates, setTemplates, addedTemplate, setAddedTemplate  }: {
  fetchData: (input: RequestInfo, init?: RequestInit | undefined) => Promise<Response>,
  templates: ResumeTemplate[],
  setTemplates: React.Dispatch<React.SetStateAction<ResumeTemplate[]>>,
  addedTemplate: ResumeTemplateUpload | null,
  setAddedTemplate: React.Dispatch<React.SetStateAction<ResumeTemplateUpload | null>>
}): React.JSX.Element {  
  const [templatesLoaded, setTemplatesLoaded] = useState<boolean>(false);
  const [removedTemplateId, setRemovedTemplateId] = useState<number>(-1);

  // fetch templates from server on page load
  useEffect(() => {
    async function getTemplates(): Promise<void> {
      await fetchData("../api/templates/")
      .then(response => response.json())
      .then(data => setTemplates(data))
      .catch(error => console.error("Error:", error))
      .finally(() => setTemplatesLoaded(true));
    }
    getTemplates();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // add template to server if addedTemplate is changed to a non-null value
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
          ...templates.filter((template) => template.docx !== ""),
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

  // delete template from server if removedTemplateName is changed to a non-empty string
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

  // remove template from templates state and queue template to be deleted from server
  function removeTemplate(id: number): void {
    setTemplates(templates.filter((template) => template.id !== id));
    setRemovedTemplateId(id);
  }

  return(
    <section>
      <h2>Templates</h2>
      <RemoveDocumentContext.Provider value={removeTemplate}>
        <ModalContext.Provider value={{modalId: "addTemplateModal", modalFocusId: "name"}}>
          <DocumentList
            documents={templates}
            areDocumentsLoaded={templatesLoaded}
            addButtonText="Upload resume template"
          />
        </ModalContext.Provider>
      </RemoveDocumentContext.Provider>
    </section>
  )
}