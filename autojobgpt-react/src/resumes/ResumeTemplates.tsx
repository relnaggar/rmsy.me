import React, { useEffect, useState } from "react";

import DocumentList from "../common/DocumentList";
import { RemoveDocumentContext } from "../common/DocumentThumbnail";
import { ModalContext } from "../common/AddDocument";
import { toFormData, closeModal } from "../common/utilities";
import { ResumeTemplate, ResumeTemplateUpload } from "./types";


export function ResumeTemplatesSection({ fetchData, templates, setTemplates, addedTemplate, setAddedTemplate  }: {
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
      return await fetchData("../api/templates/")
      .then((response) => response.json())
      .then((data) => setTemplates(data))
      .catch((error) => console.error("Error:", error))
      .finally(() => setTemplatesLoaded(true));
    }
    getTemplates();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // add template to server if addedTemplate is changed to a non-null value
  useEffect(() => {
    async function postTemplate(formData: FormData): Promise<void> {
      return await fetchData("../api/templates/", { 
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

export function AddTemplateModal({ addTemplate }: {
  addTemplate: (template: ResumeTemplateUpload) => void
}): React.JSX.Element {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>): void {
    // prevent page from reloading
    e.preventDefault();

    // close modal
    const modal: HTMLElement = document.getElementById("addTemplateModal")!;
    closeModal(modal);
    
    // add template
    const name: string = (document.getElementById("name") as HTMLInputElement).value;
    const docx: File = (document.getElementById("upload") as HTMLInputElement).files![0];
    const description: string = (document.getElementById("description") as HTMLInputElement).value;
    const templateUpload: ResumeTemplateUpload = { name, docx, description };
    addTemplate(templateUpload);

    // reset form
    e.currentTarget.reset();
  }

  return (
    <div
      className="modal fade"
      id="addTemplateModal"
      tabIndex={-1}
      aria-labelledby="addTemplateModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h1 className="modal-title fs-5" id="addTemplateModalLabel">Add Resume Template</h1>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="mb-3">
                <label htmlFor="name" className="form-label">Template Name</label>
                <input type="text" className="form-control" id="name" name="name" required />
              </div>
              <div className="mb-3">
                <label htmlFor="upload" className="form-label">Upload</label>
                <input type="file" className="form-control" id="upload" name="upload" required
                  accept=".doc,.docx,.xml,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="description" className="form-label">Description (optional)</label>
                <textarea className="form-control" id="description" name="description" rows={3}></textarea>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button type="submit" className="btn btn-primary">Submit</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}