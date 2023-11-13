import React from "react";
import { ReactComponent as PencilSquare } from "bootstrap-icons/icons/pencil-square.svg";
import { ReactComponent as Trash3 } from "bootstrap-icons/icons/trash3.svg";

import { generatePlaceholderWidths } from "./utils";
import { Document } from "./types";

export default function DocumentThumbnail({ document, beingRemoved, onClickEditDocument, onClickRemoveDocument }: {
  document: Document,
  beingRemoved?: boolean,
  onClickEditDocument?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void,
  onClickRemoveDocument?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
}): React.JSX.Element {
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
          <>
            <h6 className="p-2 m-0 bg-body border rounded">{document.name}</h6>
            <div className="btn-group ms-1" role="group">
              <button
                type="button"
                className="btn btn-secondary"
                aria-label="Edit"
                onClick={onClickEditDocument!}
                disabled={document.png === "" || beingRemoved}
              >
                <PencilSquare />
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                aria-label="Delete"
                onClick={onClickRemoveDocument!}
                disabled={document.png === "" || beingRemoved}
              >
                {document.png !== "" && beingRemoved ?
                  <div className="spinner-border spinner-border-sm" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                :
                  <Trash3 />
                }
              </button>
            </div>
          </>
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