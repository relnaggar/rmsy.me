import React from 'react';

import { UseResource } from '../hooks/useResource';
import { UseErrorAlert } from '../hooks/useErrorAlert';
import DocumentThumbnail from './DocumentThumbnail';
import AddDocumentButton from './AddDocumentButton';
import { Document } from '../api/types';
import { sortByIdPlaceholdersAtTheEnd } from './utils';


interface DocumentListProps extends
  Pick<UseResource<Document,Document>, "resources" | "fetching" | "idsBeingDeleted" | "posting">,
  Pick<UseErrorAlert, "showErrors">
{
  onClickEditDocument: (id: number) => (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void,
  onClickRemoveDocument: (id: number) => (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void,
  onClickAddDocument: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void,
  addButtonText: string,
}

const DocumentList = ({
  showErrors,
  onClickEditDocument,
  onClickRemoveDocument,
  onClickAddDocument,
  addButtonText,
  ...resourceManager
}: DocumentListProps): React.JSX.Element => {
  const { resources: documents, fetching, idsBeingDeleted } = resourceManager;

  sortByIdPlaceholdersAtTheEnd(documents);

  return (
    <div className="d-flex overflow-x-auto border border-5 p-2" role="list">
      {fetching ?
        [...Array(3)].map((_, index) => 
          <DocumentThumbnail key={index}
            showErrors={() => {}}
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
              showErrors={showErrors}
              document={document}
              onClickEdit={onClickEditDocument(document.id)}
              onClickRemove={onClickRemoveDocument(document.id)}
              beingRemoved={idsBeingDeleted.includes(document.id)}
            />
          )}
          <AddDocumentButton onClick={onClickAddDocument} buttonText={addButtonText} />
        </>        
      }
    </div>
  );
};

export default DocumentList;