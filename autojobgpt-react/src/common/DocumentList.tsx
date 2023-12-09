import React from 'react';

import DocumentThumbnail from './DocumentThumbnail';
import AddDocumentButton from './AddDocumentButton';
import { Document } from '../api/types';


interface DocumentListProps {
  documents: Document[],
  loadingDocuments: boolean,
  onClickEditDocument: (id: number) => (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void,
  onClickRemoveDocument: (id: number) => (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void,
  documentBeingRemovedId: number,
  onClickAddDocument: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void,
  addButtonText: string,
  addDisabled: boolean,
}

const DocumentList = ({
  documents,
  loadingDocuments,
  onClickEditDocument,
  onClickRemoveDocument,
  documentBeingRemovedId,
  onClickAddDocument,
  addButtonText,
  addDisabled,
}: DocumentListProps): React.JSX.Element => {
  return (
    <div className="d-flex overflow-x-auto border border-5 p-2" role="list">
      {!loadingDocuments ?
        <>
          {documents.map((document, index) => 
            document.id !== -1 && <DocumentThumbnail
              key={`${document.id}-${index}`}
              document={document}              
              onClickEditDocument={onClickEditDocument(document.id)}
              onClickRemoveDocument={onClickRemoveDocument(document.id)}
              beingRemoved={documentBeingRemovedId === document.id}
            />
          )}
          {documents.map((document, index) => 
            document.id === -1 && <DocumentThumbnail
              key={`${document.id}-${index}`}
              document={document}              
              onClickEditDocument={onClickEditDocument(document.id)}
              onClickRemoveDocument={onClickRemoveDocument(document.id)}
              beingRemoved={documentBeingRemovedId === document.id}
            />
          )}
          <AddDocumentButton onClick={onClickAddDocument} buttonText={addButtonText} disabled={addDisabled} />
        </>
      :
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
};

export default DocumentList;