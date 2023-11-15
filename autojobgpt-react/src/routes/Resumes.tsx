import React from "react";

import ResumeTemplateList from "../templates/ResumeTemplateList";
import ResumeList from "../resumes/ResumeList";


export default function ResumesPage(): React.JSX.Element {
  return (
    <main>        
      <ResumeTemplateList />      
      <ResumeList />
    </main>
  );
}