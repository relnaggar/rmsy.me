import React from 'react';

import DocumentThumbnail from './DocumentThumbnail';
import AddDocument from './AddDocument';
import { Document } from './types';


export default function DocumentList({ documents, documentsLoaded }: {
  documents: Document[],
  documentsLoaded: boolean,
}): React.JSX.Element {
  return (
    <div className="d-flex overflow-x-auto border border-5 p-2" role="list">
      {documentsLoaded ?
        <>
          {documents.map((document, _) => 
            <DocumentThumbnail document={document} key={document.id} />
          )}
          <AddDocument />
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