import React from 'react';

import DocumentThumbnail from './DocumentThumbnail';
import AddDocument from './AddDocument';
import { Document } from './types';


export default function DocumentList({
  documents,
  documentsLoaded,
  onClickEditDocument,
  onClickRemoveDocument,
  documentBeingRemovedID,
  onClickAddDocument,
  addButtonText
}: {
  documents: Document[],
  documentsLoaded: boolean,
  onClickEditDocument: (id: number) => (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void,
  onClickRemoveDocument: (id: number) => (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void,
  documentBeingRemovedID: number,
  onClickAddDocument: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void,
  addButtonText: string,
}): React.JSX.Element {
  return (
    <div className="d-flex overflow-x-auto border border-5 p-2" role="list">
      {documentsLoaded ?
        <>
          {documents.map((document, _) => 
            <DocumentThumbnail
              key={document.id}
              document={document}              
              onClickEditDocument={onClickEditDocument(document.id)}
              onClickRemoveDocument={onClickRemoveDocument(document.id)}
              beingRemoved={documentBeingRemovedID === document.id}
            />
          )}
          <AddDocument onClickAddDocument={onClickAddDocument} buttonText={addButtonText} />
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