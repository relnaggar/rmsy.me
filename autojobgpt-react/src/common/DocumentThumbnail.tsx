import React, { useRef } from "react";
import { ReactComponent as PencilSquareIcon } from "bootstrap-icons/icons/pencil-square.svg";
import { ReactComponent as Trash3Icon } from "bootstrap-icons/icons/trash3.svg";
import { ReactComponent as FileArrowDownIcon } from "bootstrap-icons/icons/file-arrow-down.svg";

import { generatePlaceholderWidths } from "./utils";
import { Document } from "./types";


interface DocumentThumbnailProps {
  document: Document,
  beingRemoved?: boolean,
  onClickEditDocument?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void,
  onClickRemoveDocument?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void,
};

const DocumentThumbnail = ({
  document,
  beingRemoved = false,
  onClickEditDocument,
  onClickRemoveDocument
}: DocumentThumbnailProps): React.JSX.Element => {
  const placeholderWidths = useRef<number[]>([]);

  if (placeholderWidths.current.length === 0) {
    placeholderWidths.current = generatePlaceholderWidths(15);
  }

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
            {placeholderWidths.current.map((width, index) => {
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
            {document.png !== "" && (
              <div className="btn-group ms-1" role="group">
                <button
                  type="button"
                  className="btn btn-secondary"
                  aria-label="Edit"
                  onClick={onClickEditDocument!}
                  disabled={beingRemoved}
                >
                  <PencilSquareIcon />
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  aria-label="Delete"
                  onClick={onClickRemoveDocument!}
                  disabled={beingRemoved}
                >
                  {beingRemoved ?
                    <div className="spinner-border spinner-border-sm" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  :
                    <Trash3Icon />
                  }
                </button>
              </div>
            )}
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
          <a download href={document.docx} className="btn btn-primary" role="button">
            <FileArrowDownIcon className="me-1" />
            Download
          </a>
        </div>
      }
    </div>
  );
};

export default DocumentThumbnail;