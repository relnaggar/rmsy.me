import React, { useRef, useState } from "react";
import { ReactComponent as FileArrowDownIcon } from "bootstrap-icons/icons/file-arrow-down.svg";
import { ReactComponent as EyeIcon } from "bootstrap-icons/icons/eye.svg";

import useApiCall, { OnSuccessParams } from "../hooks/useApiCall";
import useFetch from "../hooks/useFetch";
import { UseErrorAlert } from "../hooks/useErrorAlert";
import EditDeleteButtonGroup, { EditDeleteButtonGroupProps } from "./EditDeleteButtonGroup";
import { Document } from '../api/types';


const generatePlaceholderWidths = (numberOfRows: number): number[] => {
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
};

interface DocumentThumbnailProps extends
  Pick<UseErrorAlert, "showErrors">,
  Partial<EditDeleteButtonGroupProps>, Pick<UseErrorAlert, "showErrors">
{
  document: Document,
};

const DocumentThumbnail = ({
  showErrors,
  document,
  ...editDeleteButtonGroupProps
}: DocumentThumbnailProps): React.JSX.Element => {
  const [imageUrl, setImageUrl] = useState<string>("");
  const placeholderWidths = useRef<number[]>([]);
  
  if (placeholderWidths.current.length === 0) {
    placeholderWidths.current = generatePlaceholderWidths(15);
  }

  const onClickDownloadSuccess = async ({response}: OnSuccessParams) => {
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = downloadUrl;
    link.download = document.docx.split("/").pop()!;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
  };

  const { call: download } = useApiCall("GET", {
    onSuccess: onClickDownloadSuccess,
    onFail: showErrors,
  });

  const handleClickDownload = (_: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
    download({apiPath: document.docx.split("/api/")[1]});
  };

  const onLoadImageSuccess = (blob: Blob): void => {
    setImageUrl(URL.createObjectURL(blob));
  };

  const { fetching: fetchingImage } = useFetch<Blob>(document && document.png ? document.png.split("/api/")[1] : "", {
    onSuccess: onLoadImageSuccess,
    onFail: showErrors,
    responseType: "blob",
    initialFetch: document.png !== "",
  });

  return (
    <div
      className="document text-center me-3"
      role="listitem"
      aria-label={document.name}
      aria-busy={document.png === ""}
    >
      {/* document image */}
      {document.png === "" || fetchingImage ?
        <div className="document-image img-thumbnail">
          <p className="placeholder-glow pt-5 text-start">
            {placeholderWidths.current.map((width, index) => {
              return (
                width === 0 ?
                  <br key={index} />
                :
                  <span key={index} className={`placeholder me-1 col-${width}`}></span>
              );
            })}
          </p>
        </div>
      :
        <img src={imageUrl} className="document-image img-thumbnail" alt={document.name} />
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
              <EditDeleteButtonGroup
                onClickEdit={editDeleteButtonGroupProps.onClickEdit!}
                onClickRemove={editDeleteButtonGroupProps.onClickRemove!}
                beingRemoved={editDeleteButtonGroupProps.beingRemoved!}
              />
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
          <div className="d-flex">
            <button onClick={handleClickDownload} className="btn btn-primary text-nowrap">
              <FileArrowDownIcon className="me-1" />
              Download
            </button>
            { document.png !== "" &&
              <a href={document.png}
                className="ms-2 btn btn-primary text-nowrap" role="button" target="_blank" rel="noreferrer"
              >
                <EyeIcon className="me-1" />
                Preview
              </a>
            }
          </div>
        </div>
      }
    </div>
  );
};

export default DocumentThumbnail;