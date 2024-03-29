import React from "react";

import TemplateList from "../templates/TemplateList";
import TailoredDocumentList from "../tailoredDocuments/TailoredDocumentList";
import { DocumentType } from "../api/types";
import useScrollToTop from "../hooks/useScrollToTop";


export interface DocumentsPageProps {
  documentType: DocumentType,
  documentTypeLabel: string,
};

const DocumentsPage = ({
  documentType,
  documentTypeLabel,
}: DocumentsPageProps): React.JSX.Element => {
  useScrollToTop();
  return (
    <>
      <TemplateList documentType={documentType} documentTypeLabel={documentTypeLabel} />
      <TailoredDocumentList documentType={documentType} documentTypeLabel={documentTypeLabel} />
    </>
  );
};

export default DocumentsPage;