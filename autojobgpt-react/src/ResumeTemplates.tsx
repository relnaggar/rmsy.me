import React, { useEffect, useState } from "react";
import { Modal } from "bootstrap";

import { RemoveDocumentContext, DocumentData, DocumentList } from "./Documents";
import { toFormData } from "./utilities";


export class ResumeTemplateDownload {
  name: string;
  upload: string;
  png: string;
  description?: string;

  constructor({name, upload, png, description}: {
    name: string,
    upload: string,
    png: string,
    description?: string
  }) {
    this.name = name;
    this.upload = upload;
    this.png = png;
    this.description = description;
  }

  toDocumentData(): DocumentData {
    return new DocumentData(
      this.name,
      this.png,
      this.upload,
      this.description
    );
  }
}

export type ResumeTemplateUpload = {
  name: string,
  upload: File,
  description?: string
}

export function ResumeTemplatesSection({ fetchData, templates, setTemplates, addedTemplate, setAddedTemplate  }: {
  fetchData: (input: RequestInfo, init?: RequestInit | undefined) => Promise<Response>,
  templates: ResumeTemplateDownload[],
  setTemplates: React.Dispatch<React.SetStateAction<ResumeTemplateDownload[]>>,
  addedTemplate: ResumeTemplateUpload | null,
  setAddedTemplate: React.Dispatch<React.SetStateAction<ResumeTemplateUpload | null>>
}): React.JSX.Element {  
  const [templatesLoaded, setTemplatesLoaded] = useState<boolean>(false);
  const [removedTemplateName, setRemovedTemplateName] = useState<string>("");

  // fetch templates from server on page load
  useEffect(() => {
    async function getTemplates(): Promise<void> {
      return await fetchData("../api/templates/")
      .then((response) => response.json())
      .then((data) => setTemplates(data.map((d: ResumeTemplateDownload) => new ResumeTemplateDownload(d))))
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
          ...templates.filter((template) => template.upload !== ""),
          new ResumeTemplateDownload(data)
        ]);
        // template has been added so set addedTemplate to null
        setAddedTemplate(null);
      })
      .catch((error) => console.error("Error:", error));
    }
    if (addedTemplate) {
      postTemplate(toFormData(addedTemplate));
    }
  }, [addedTemplate]); // eslint-disable-line react-hooks/exhaustive-deps

  // delete template from server if removedTemplateName is changed to a non-empty string
  useEffect(() => {
    async function deleteTemplate(): Promise<void> {
      await fetchData(`../api/templates/${removedTemplateName}/`, { 
        method: "DELETE", 
        headers: { "Content-Type": "application/json" },
      })
      .then((response) => response.status === 204 && setRemovedTemplateName(""))
      .catch((error) => console.error("Error:", error));
    }
    if (removedTemplateName) {
      deleteTemplate();
    }
  }, [removedTemplateName]); // eslint-disable-line react-hooks/exhaustive-deps

  // remove template from templates state and queue template to be deleted from server
  function removeTemplate(templateName: string): void {
    setTemplates(templates.filter((template) => template.name !== templateName));
    setRemovedTemplateName(templateName);
  }

  return(
    <section>
      <h2>Templates</h2>
      <RemoveDocumentContext.Provider value={removeTemplate}>
        <DocumentList
          documents={templates.map((template) => template.toDocumentData())}
          areDocumentsLoaded={templatesLoaded}
          addButtonText="Upload resume template"
        />
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
    const modalElement: HTMLElement = document.getElementById("addTemplateModal")!;
    if (modalElement) {
      Modal.getInstance(modalElement)?.toggle();
      // Bootstrap is supposed to remove the modal-backdrop but it's not working properly
      document.querySelector(".modal-backdrop")?.remove();
    }
    
    // add template
    const name: string = (document.getElementById("name") as HTMLInputElement).value;
    const upload: File = (document.getElementById("upload") as HTMLInputElement).files![0];
    const description: string = (document.getElementById("description") as HTMLInputElement).value;
    const templateUpload: ResumeTemplateUpload = { name, upload, description };
    addTemplate(templateUpload);

    // reset form
    e.currentTarget.reset();
  }

  return (
    <div className="modal fade" id="addTemplateModal" tabIndex={-1} aria-labelledby="addTemplateModalLabel" aria-hidden="true">
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
                <input type="file" className="form-control" id="upload" name="upload" accept=".doc,.docx,.xml,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" required />
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