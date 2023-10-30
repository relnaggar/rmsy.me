import React, {createContext} from "react";

import { generatePlaceholderWidths } from "./utilities";


export class DocumentData {
  name: string;
  png: string;
  docx: string;
  description?: string;

  constructor(name: string, png: string, docx: string, description?: string) {
    this.name = name;
    this.png = png;
    this.docx = docx;
    this.description = description;
  }

  static newPlaceholder(): DocumentData {
    return new DocumentData("", "", "", "");
  }
}

export const RemoveDocumentContext = createContext<((templateName: string) => void)>(() => {});

export function DocumentList({ documents, areDocumentsLoaded, addButtonText }: {
  documents: DocumentData[],
  areDocumentsLoaded: boolean,
  addButtonText: string
}): React.JSX.Element {
  return (
    <div className="d-flex overflow-x-auto border border-5 p-2" role="list">
      {areDocumentsLoaded ?
        <>
          {documents.map((document, _) => 
            <Document document={document} key={document.name} />
          )}
          <AddDocument buttonText={addButtonText}/>
        </>
      :
        // display 3 placeholders while templates are being fetched
        [...Array(3)].map((_, index) => 
          <Document document={DocumentData.newPlaceholder()} key={index} />
        )
      }
    </div>
  );
}

export function Document({ document }: {
  document: DocumentData
}): React.JSX.Element {
  const removeDocument: (name: string) => void = React.useContext(RemoveDocumentContext);

  return (
    <div className="document text-center me-3" role="listitem" aria-label={document.name} aria-busy={document.png === ""}>
      {/* document image */}
      {document.png === "" ?
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
        <img src={document.png} className="document-image img-thumbnail" alt={document.name} />
      }

      {/* document header */}
      <div className="document-header d-flex justify-content-between w-100 p-2 border-bottom border-3 border-dark bg-dark bg-opacity-50 rounded-top">
        {document.name === "" ?
          <h6 className="p-1 m-0 bg-body border rounded w-50">
            <div className="placeholder-glow text-start">
              <span className="placeholder w-100"></span>
            </div>
          </h6>
        :
          <h6 className="p-1 m-0 bg-body border rounded">{document.name}</h6>
        }
        {document.name !== "" &&
          <button type="button" className="btn-close" aria-label="Delete" onClick={(e) => removeDocument(document.name)}></button>
        }
      </div>

      {/* document body */}
      {document.png === "" &&
        <div className="document-body">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      }

      {/* document footer */}
      {document.docx !== "" && 
        <div className="document-footer pb-4">
          <a href={document.docx} className="btn btn-primary" role="button">Download</a>       
        </div>
      }
    </div>
  );
}

export function AddDocument({ buttonText }: {
  buttonText: string
}): React.JSX.Element {
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
        >{`+ ${buttonText}`}</button>
      </div>
    </div>
  );
}