import React from "react";

import ResumeTemplateList from "../templates/ResumeTemplateList";
import ResumeList from "../resumes/ResumeList";


const ResumesPage = (): React.JSX.Element => {
  return (
    <main>        
      <ResumeTemplateList />      
      <ResumeList />
    </main>
  );
};

export default ResumesPage;