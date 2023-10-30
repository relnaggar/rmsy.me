import React, { useState } from "react";

import { ResumeTemplateDownload, ResumeTemplateUpload, ResumeTemplatesSection, AddTemplateModal } from "./ResumeTemplates";
import { ResumesSection } from "./Resumes";


export default function ResumesPage({ fetchData }: {
  fetchData: (input: RequestInfo, init?: RequestInit | undefined) => Promise<Response>
}): React.JSX.Element {
  const [templates, setTemplates] = useState<ResumeTemplateDownload[]>([]);
  const [addedTemplate, setAddedTemplate] = useState<ResumeTemplateUpload | null>(null);

  function addTemplate(templateUpload: ResumeTemplateUpload): void {
    // add placeholder template to templates state
    const placeholderTemplate = new ResumeTemplateDownload({
      name: templateUpload.name,
      upload: "",
      png: "",
      description: templateUpload.description
    });
    setTemplates([...templates, placeholderTemplate]);

    // queue template to be added to server
    setAddedTemplate(templateUpload);
  }

  return (
    <>
      <main>
        <ResumeTemplatesSection
          fetchData={fetchData}
          templates={templates}
          setTemplates={setTemplates}
          addedTemplate={addedTemplate}
          setAddedTemplate={setAddedTemplate}
        />
        <ResumesSection fetchData={fetchData} />
      </main>
      <AddTemplateModal addTemplate={addTemplate} />
    </>
  );
}