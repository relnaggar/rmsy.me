import React from "react";

import DocumentsPage from "./DocumentsPage";


const CoverLettersPage = (): React.JSX.Element => {
  return (
    <DocumentsPage documentType="coverLetter" documentTypeLabel="Cover Letter" />
  );
};

export default CoverLettersPage;