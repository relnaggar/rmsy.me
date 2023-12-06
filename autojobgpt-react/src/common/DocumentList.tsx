import React from 'react';

import DocumentThumbnail from './DocumentThumbnail';
import AddDocument from './AddDocument';
import { Document } from './types';


export default function DocumentList({
  documents,
  loadingDocuments,
  onClickEditDocument,
  onClickRemoveDocument,
  documentBeingRemovedID,
  onClickAddDocument,
  addButtonText,
  addDisabled,
}: {
  documents: Document[],
  loadingDocuments: boolean,
  onClickEditDocument: (id: number) => (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void,
  onClickRemoveDocument: (id: number) => (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void,
  documentBeingRemovedID: number,
  onClickAddDocument: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void,
  addButtonText: string,
  addDisabled: boolean,
}): React.JSX.Element {
  return (
    <div className="d-flex overflow-x-auto border border-5 p-2" role="list">
      {!loadingDocuments ?
        <>
          {documents.map((document, _) => 
            document.id !== -1 && <DocumentThumbnail
              key={document.id}
              document={document}              
              onClickEditDocument={onClickEditDocument(document.id)}
              onClickRemoveDocument={onClickRemoveDocument(document.id)}
              beingRemoved={documentBeingRemovedID === document.id}
            />
          )}
          {documents.map((document, index) => 
            document.id === -1 && <DocumentThumbnail
              key={index}
              document={document}              
              onClickEditDocument={onClickEditDocument(document.id)}
              onClickRemoveDocument={onClickRemoveDocument(document.id)}
              beingRemoved={documentBeingRemovedID === document.id}
            />
          )}
          <AddDocument onClickAddDocument={onClickAddDocument} buttonText={addButtonText} disabled={addDisabled} />
        </>
      :
        // display 3 placeholders while templates are being fetched
        [...Array(3)].map((_, index) => 
          <DocumentThumbnail document={{
            "id": -1,
            "name": "",
            "png": "",
            "docx": "",
          }} key={index} />
        )
      }
    </div>
  );
}