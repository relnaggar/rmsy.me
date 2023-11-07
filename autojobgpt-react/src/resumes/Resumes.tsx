import React from "react";

import ResumeTemplateList from "./ResumeTemplateList";
import ResumeList from "./ResumeList";


export default function ResumesPage(): React.JSX.Element {
  return (
    <main>        
      <ResumeTemplateList />      
      <ResumeList />
    </main>
  );
}