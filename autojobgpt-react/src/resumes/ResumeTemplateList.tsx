import React, { useContext, useEffect, useState } from "react";

import DocumentList from "../common/DocumentList";
import { RemoveDocumentContext } from "../common/DocumentThumbnail";
import { toFormData } from "../common/utilities";
import { FetchDataContext } from "../routes/routesConfig";
import { ResumeTemplate, ResumeTemplateUpload } from "./types";


export default function ResumeTemplateList({ templates, setTemplates, addedTemplate, setAddedTemplate  }: {
  templates: ResumeTemplate[],
  setTemplates: React.Dispatch<React.SetStateAction<ResumeTemplate[]>>,
  addedTemplate: ResumeTemplateUpload | null,
  setAddedTemplate: React.Dispatch<React.SetStateAction<ResumeTemplateUpload | null>>
}): React.JSX.Element {  
  const fetchData = useContext(FetchDataContext);

  const [templatesLoaded, setTemplatesLoaded] = useState<boolean>(false);
  const [removedTemplateId, setRemovedTemplateId] = useState<number>(-1);

  // fetch templates from server on page load
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

  // remove template from templates state and queue template to be deleted from server
  function removeTemplate(id: number): void {
    setTemplates(templates.filter((template) => template.id !== id));
    setRemovedTemplateId(id);
  }

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

  return(
    <section>
      <h2>Templates</h2>
      <RemoveDocumentContext.Provider value={removeTemplate}>
        <DocumentList documents={templates} areDocumentsLoaded={templatesLoaded} />
      </RemoveDocumentContext.Provider>
    </section>
  )
}