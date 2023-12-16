import React from 'react';

import { UseResource } from '../hooks/useResource';
import DocumentThumbnail from './DocumentThumbnail';
import AddDocumentButton from './AddDocumentButton';
import { Document } from '../api/types';


interface DocumentListProps extends Pick<UseResource<Document,Document>,
  "resources" | "fetching" | "idBeingDeleted" | "posting"
> {
  onClickEditDocument: (id: number) => (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void,
  onClickRemoveDocument: (id: number) => (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void,
  onClickAddDocument: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void,
  addButtonText: string,
}

const DocumentList = ({
  onClickEditDocument,
  onClickRemoveDocument,
  onClickAddDocument,
  addButtonText,
  ...resourceManager
}: DocumentListProps): React.JSX.Element => {
  const { resources: documents, fetching, idBeingDeleted, posting } = resourceManager;

  // sort documents by id, putting placeholders with id -1 at the end
  documents.sort((a, b) => {
    if (a.id === -1) {
      return 1;
    } else if (b.id === -1) {
      return -1;
    } else {
      return a.id - b.id;
    }
  });

  return (
    <div className="d-flex overflow-x-auto border border-5 p-2" role="list">
      {fetching ?
        [...Array(3)].map((_, index) => 
          <DocumentThumbnail key={index}
            document={{"id": -1, "name": "", "png": "", "docx": ""}}            
            onClickEdit={() => {}}
            onClickRemove={() => {}}
            beingRemoved={false}
          />
        )
      :
        <>
          {documents.map((document, index) =>
            <DocumentThumbnail key={`${document.id}-${index}`}
              document={document}              
              onClickEdit={onClickEditDocument(document.id)}
              onClickRemove={onClickRemoveDocument(document.id)}
              beingRemoved={idBeingDeleted === document.id}
            />
          )}
          <AddDocumentButton onClick={onClickAddDocument} buttonText={addButtonText} disabled={posting} />
        </>        
      }
    </div>
  );
};

export default DocumentList;