import React, { useState, useEffect, createContext } from "react";
import { Modal } from "bootstrap";

type ResumeTemplateUpload = {
  name: string,
  upload: File,
  description?: string
}

export type ResumeTemplateDownload = {
  name: string
  upload: string,
  png: string,
  description?: string
}

const RemoveTemplateContext = createContext<((name: string) => void)>(() => {});

export default function Resumes({ fetchData }: {
  fetchData: (input: RequestInfo, init?: RequestInit | undefined) => Promise<Response>
}): React.JSX.Element {
  const [templates, setTemplates] = useState<ResumeTemplateDownload[]>([]);
  const [templatesLoaded, setTemplatesLoaded] = useState<boolean>(false);
  const [addedTemplate, setAddedTemplate] = useState<ResumeTemplateUpload | null>(null);  
  const [removedTemplateName, setRemovedTemplateName] = useState<string>("");

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
          ...templates.filter((template) => template.upload !== ""),
          data
        ]);
        // template has been added so set addedTemplate to null
        setAddedTemplate(null);
      })
      .catch((error) => console.error("Error:", error));
    }

    function toFormData(object: {[index: string]: string | File}): FormData {
      const formData: FormData = new FormData();
      for (const [key, value] of Object.entries(object)) {
        formData.append(key, value);
      }
      return formData;
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

  function addTemplate(templateUpload: ResumeTemplateUpload): void {
    // add placeholder template to templates state
    const placeholderTemplate: ResumeTemplateDownload = {
      name: templateUpload.name,
      upload: "",
      png: "",
      description: templateUpload.description
    }
    setTemplates([...templates, placeholderTemplate]);

    // queue template to be added to server
    setAddedTemplate(templateUpload);
  }  

  // remove template from templates state and queue template to be deleted from server
  function removeTemplate(templateName: string): void {
    setTemplates(templates.filter((template) => template.name !== templateName));
    setRemovedTemplateName(templateName);
  }

  return (
    <>
      <main>
        <section>
          <h2>Templates</h2>
          <RemoveTemplateContext.Provider value={removeTemplate}>
            <ResumeTemplates templates={templates} templatesLoaded={templatesLoaded} />
          </RemoveTemplateContext.Provider>
        </section>
      </main>
      <AddTemplateModal addTemplate={addTemplate} />
    </>
  );
}

function ResumeTemplates({ templates, templatesLoaded }: {
  templates: ResumeTemplateDownload[]
  templatesLoaded: boolean
}): React.JSX.Element {
  return (
    <div className="d-flex overflow-x-auto border border-5 p-2" role="list">
      {templatesLoaded ?
        <>
          {templates.map((template, _) => 
            <ResumeTemplate template={template} key={template.name} />
          )}
          <AddResumeButton />
        </>
      :
        // display 3 placeholders while templates are being fetched
        [...Array(3)].map((_, index) => 
          <ResumeTemplatePlaceholder key={index} />
        )
      }
    </div>
  );
}

function ResumeTemplate({ template }: {
  template: ResumeTemplateDownload
}): React.JSX.Element {
  const removeTemplate: (name: string) => void = React.useContext(RemoveTemplateContext);

  return (
    <div className="document text-center me-3" role="listitem" aria-label={template.name} aria-busy={template.png === ""}>
      {/* document image */}
      {template.png === "" ?
        <div className="document-image img-thumbnail">
          <p className="placeholder-glow pt-5 text-start">
            {generatePlaceholderWidths(15).map((width, index) => {
              return (
                width === 0 ?
                  <br key={index} />
                :
                  <span className={`placeholder me-1 col-${width}`} key={index}></span>
              );                  
            })}
          </p>
        </div>
      :
        <img src={template.png} className="document-image img-thumbnail" alt={template.name} />
      }

      {/* document header */}
      <div className="document-header d-flex justify-content-between w-100 p-2 border-bottom border-3 border-dark bg-dark bg-opacity-50 rounded-top">
        {template.name === "" ?
          <h6 className="p-1 m-0 bg-body border rounded w-50">
            <div className="placeholder-glow text-start">
              <span className="placeholder w-100"></span>
            </div>
          </h6>
        :
          <h6 className="p-1 m-0 bg-body border rounded">{template.name}</h6>
        }
        {template.name !== "" &&
          <button type="button" className="btn-close" aria-label="Delete" onClick={(e) => removeTemplate(template.name)}></button>
        }
      </div>

      {/* document body */}
      {template.png === "" &&
        <div className="document-body">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      }

      {/* document footer */}
      {template.upload !== "" && 
        <div className="document-footer pb-4">
          <a href={template.upload} className="btn btn-primary" role="button">Download</a>       
        </div>
      }
    </div>
  );
}

function AddResumeButton(): React.JSX.Element {
  // focus on name input when add template modal is shown
  function handleAddTemplateClick(e: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
    const jobModal: HTMLElement = document.getElementById("addTemplateModal")!;
    jobModal.addEventListener("shown.bs.modal", () => {
      document.getElementById("name")?.focus();
    });
  }

  return (
    <div className="document">
      <div className="document-image img-thumbnail"></div>
      <div className="document-body">
        <button
          type="button"
          className="btn btn-primary"
          data-bs-toggle="modal"
          data-bs-target="#addTemplateModal"
          onClick={handleAddTemplateClick}
        >+ Add resume template</button>
      </div>
    </div>
  );
}

function ResumeTemplatePlaceholder(): React.JSX.Element {
  return <ResumeTemplate template={{
    name: "",
    upload: "",
    png: ""
  }} />;
}

function generatePlaceholderWidths(numberOfRows: number): number[] {
  // generate a random list of numbers
  // the numbers represent the width of each placeholder span
  // there should be (numberOfRows) groups of numbers
  // each group represents a row of placeholders
  // each group of numbers should add up to (maxWidth) or less

  const maxWidth: number = 10;
  const placeHolderWidths: number[] = [];
  let row = 1;
  let sum = 0;
  while (row < numberOfRows) {
    let width: number = Math.floor(Math.random() * maxWidth) + 1;    
    if (sum + width <= maxWidth) {
      placeHolderWidths.push(width);
      sum += width;
    } else {
      placeHolderWidths.push(0);
      row += 1;
      placeHolderWidths.push(width);
      sum = width;
    }
  }
  return placeHolderWidths;
}

function AddTemplateModal({ addTemplate }: {
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