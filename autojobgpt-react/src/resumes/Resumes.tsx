import React, { useState } from "react";

import ResumeTemplateList from "./ResumeTemplateList";
import ResumeList from "./ResumeList";
import AddTemplateModal from "./AddTemplateModal";
import GenerateResumeModal from './GenerateResumeModal';
import { ShowModalButtonContext } from "../common/AddDocument";
import { ResumeTemplate, ResumeTemplateUpload, Resume, ResumeUpload } from "./types";


export default function ResumesPage({ fetchData }: {
  fetchData: (input: RequestInfo, init?: RequestInit | undefined) => Promise<Response>
}): React.JSX.Element {
  const [templates, setTemplates] = useState<ResumeTemplate[]>([]);
  const [addedTemplate, setAddedTemplate] = useState<ResumeTemplateUpload | null>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [addedResume, setAddedResume] = useState<ResumeUpload | null>(null);
  const [showAddTemplate, setShowAddTemplate] = useState<boolean>(false);
  const [showGenerateResume, setShowGenerateResume] = useState<boolean>(false);

  function addTemplate(templateUpload: ResumeTemplateUpload): void {
    // add placeholder template to templates state
    const placeholderTemplate: ResumeTemplate = {
      id: -1,
      name: templateUpload.name,
      docx: "",
      png: "",
      description: templateUpload.description
    };
    setTemplates([...templates, placeholderTemplate]);

    // queue template to be added to server
    setAddedTemplate(templateUpload);
  }

  function addResume(resume: ResumeUpload): void {
    // add placeholder resume to resumes state
    const placeholderResume: Resume = {
      id: -1,
      substitutions: [],
      version: -1,
      docx: "",
      png: "",
      chat_messages: [],
      job: resume.job,
      template: resume.template,
      name: "",
    };
    setResumes([...resumes, placeholderResume]);

    // queue resume to be added to server
    setAddedResume(resume);
  }

  return (
    <>
      <main>
        <ShowModalButtonContext.Provider value={{setShow: setShowAddTemplate, buttonText: "Upload resume template"}}>
          <ResumeTemplateList
            fetchData={fetchData}
            templates={templates}
            setTemplates={setTemplates}
            addedTemplate={addedTemplate}
            setAddedTemplate={setAddedTemplate}
          />
        </ShowModalButtonContext.Provider>
        <ShowModalButtonContext.Provider value={{setShow: setShowGenerateResume, buttonText: "Generate new resume"}}>
          <ResumeList
            fetchData={fetchData}
            resumes={resumes}
            setResumes={setResumes}
            addedResume={addedResume}
            setAddedResume={setAddedResume}
          />
         </ShowModalButtonContext.Provider>
      </main>
      <AddTemplateModal show={showAddTemplate} setShow={setShowAddTemplate} addTemplate={addTemplate} />
      <GenerateResumeModal show={showGenerateResume} setShow={setShowGenerateResume} addResume={addResume}
      />
    </>
  );
}