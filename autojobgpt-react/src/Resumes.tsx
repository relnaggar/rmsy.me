import React, { useState, useEffect } from 'react';
import { Modal } from 'bootstrap';

type ResumeTemplateUpload = {
  name: string,
  upload: File,
  description?: string
}

type ResumeTemplateDownload = {
  name: string
  upload: string,
  png: string,
  description?: string
}

export default function Resumes({ fetchData }: {
  fetchData: (input: RequestInfo, init?: RequestInit | undefined) => Promise<Response>
}): React.JSX.Element {
  const [templates, setTemplates]: [
    ResumeTemplateDownload[], React.Dispatch<React.SetStateAction<ResumeTemplateDownload[]>>
  ] = useState<ResumeTemplateDownload[]>([]);
  const [addedTemplate, setAddedTemplate]: [
    ResumeTemplateUpload | null, React.Dispatch<React.SetStateAction<ResumeTemplateUpload | null>>
  ] = useState<ResumeTemplateUpload | null>(null);
  const [loaded, setLoaded]: [
    boolean, React.Dispatch<React.SetStateAction<boolean>>
  ] = useState<boolean>(false);

  function handleAddTemplateClick(e: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
    const jobModal: HTMLElement | null = document.getElementById("addTemplateModal");
    jobModal?.addEventListener('shown.bs.modal', () => {
      document.getElementById("name")?.focus();
    });
  }

  useEffect(() => {
    async function getTemplates(): Promise<void> {
      return await fetchData('../api/templates/')
      .then((response) => response.json())
      .then((data) => {
        setTemplates(data);
      })
      .catch((error) => console.error("Error:", error))
      .finally(() => setLoaded(true));
    }
    getTemplates();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    async function postTemplate(formData: FormData): Promise<void> {
      return await fetchData('../api/templates/', { 
        method: 'POST', 
        body: formData
      })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setTemplates([
          ...templates.filter((template) => template.upload !== ''),
          data
        ]);
        setAddedTemplate(null);
      })
      .catch((error) => console.error("Error:", error));
    }
    if (addedTemplate) {
      const formData: FormData = new FormData();
      for (const [key, value] of Object.entries(addedTemplate)) {
        formData.append(key, value);
      }
      postTemplate(formData);
    }
  }, [addedTemplate]); // eslint-disable-line react-hooks/exhaustive-deps

  function addTemplate(template: ResumeTemplateUpload): void {
    const placeholderTemplate: ResumeTemplateDownload = {
      name: template.name,
      upload: '',
      png: '',
      description: template.description
    }
    setTemplates([...templates, placeholderTemplate]);
    setAddedTemplate(template);
  }

  return (
    <>
      <main>
        <ResumeTemplates templates={templates} onAddTemplateClick={handleAddTemplateClick} loaded={loaded} />
      </main>
      <AddTemplateModal addTemplate={addTemplate} />
    </>
  );
}

function ResumeTemplates({ templates, onAddTemplateClick, loaded }: {
  templates: ResumeTemplateDownload[],
  onAddTemplateClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
  loaded: boolean
}): React.JSX.Element {
  return (
    <div className="d-flex overflow-x-auto border border-5 p-2">
      {loaded ?
        <>
          {templates.map((template, _) => 
            <ResumeTemplate template={template} key={template.name} />
          )}
          <AddResumeButton onAddTemplateClick={onAddTemplateClick} />
        </>
      :
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
  return (
    <div className="document text-center me-3">
      {template.png === '' ?
        <div className="document-image img-thumbnail text-start">
          <p className="placeholder-glow pt-5">
            {generatePlaceholderWidths(15).map((width, index) => {
              return (
                width === 0 ?
                  <br />
                :
                  <span className={"placeholder me-1 col-"+width} key={index}></span>
              );                  
            })}
          </p>
        </div>
      :
        <img src={template.png} className="document-image img-thumbnail" alt={template.name} />
      }
      <div className="document-header d-flex justify-content-between w-100 p-2 border-bottom border-3 border-dark bg-dark bg-opacity-50 rounded-top">
        {template.name === '' ?
          <h6 className="p-1 m-0 bg-body border rounded w-50">
            <div className="placeholder-glow text-start">
              <span className="placeholder w-100"></span>
            </div>
          </h6>
        :
          <h6 className="p-1 m-0 bg-body border rounded">{template.name}</h6>
        }
        {template.name !== '' &&
          <button type="button" className="btn-close" aria-label="Remove" onClick={() => {}}></button>
        }
      </div>
      {template.png === '' &&
        <div className="document-body">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      }
      {template.upload !== '' && 
        <div className="document-footer pb-4">
          <a href={template.upload} className="btn btn-primary">Download</a>       
        </div>
      }
    </div>
  );
}

function AddResumeButton({ onAddTemplateClick }: {
  onAddTemplateClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
}): React.JSX.Element {
  return (
    <div className="document">
      <div className="document-image img-thumbnail"></div>
      <div className="document-body">
        <button
          type="button"
          className="btn btn-primary"
          data-bs-toggle="modal"
          data-bs-target="#addTemplateModal"
          onClick={onAddTemplateClick}
        >+ Add resume template</button>
      </div>
    </div>
  );
}

function ResumeTemplatePlaceholder(): React.JSX.Element {
  return <ResumeTemplate template={{
    name: '',
    upload: '',
    png: ''
  }} />;
}

function generatePlaceholderWidths(numberOfRows: number): number[] {
  // generate a random list of numbers
  // the numbers represent the width of each placeholder span
  // there should be 15 groups of numbers
  // each group represents a row of placeholders
  // each group of numbers should add up to 10 or less

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
    e.preventDefault();
    const modalElement: HTMLElement | null = document.getElementById("addTemplateModal");
    if (modalElement) {
      Modal.getInstance(modalElement)?.toggle();

      // Bootstrap is supposed to remove the modal-backdrop but it's not working properly
      document.querySelector(".modal-backdrop")?.remove();
    }
    
    const name: string = (document.getElementById("templateName") as HTMLInputElement).value;
    const upload: File = ((document.getElementById("upload") as HTMLInputElement).files as FileList)[0];
    const description: string = (document.getElementById("description") as HTMLInputElement).value;

    addTemplate({ name, upload, description });
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
                <label htmlFor="templateName" className="form-label">Template Name</label>
                <input type="text" className="form-control" id="templateName" name="templateName" required />
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