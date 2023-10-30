import React from 'react';

import { RemoveDocumentContext, DocumentList } from './Documents';


export function ResumesSection({ fetchData }: {
  fetchData: (input: RequestInfo, init?: RequestInit | undefined) => Promise<Response>
}): React.JSX.Element {
  return(
    <section>
      <h2>Resumes</h2>
      <RemoveDocumentContext.Provider value={()=>{}}>
        <DocumentList
          documents={[]}
          areDocumentsLoaded={false}
          addButtonText="Generate new resume"
        />
      </RemoveDocumentContext.Provider>
    </section>
  )
}