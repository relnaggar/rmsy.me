import React, { createContext } from "react";

import { generatePlaceholderWidths } from "./utilities";
import { Document } from "./types";


export const RemoveDocumentContext = createContext<((id: number) => void)>(() => {});

export default function DocumentThumbnail({ document }: {
  document: Document
}): React.JSX.Element {
  const removeDocument: (id: number) => void = React.useContext(RemoveDocumentContext);

  return (
    <div
      className="document text-center me-3"
      role="listitem"
      aria-label={document.name}
      aria-busy={document.png === ""}
    >
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
      <div className={"document-header d-flex justify-content-between w-100 p-2 border-bottom border-3 border-dark " +
          "bg-dark bg-opacity-50 rounded-top"}>
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
          <button
            type="button"
            className="btn-close"
            aria-label="Delete"
            onClick={(e) => removeDocument(document.id)}
          ></button>
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