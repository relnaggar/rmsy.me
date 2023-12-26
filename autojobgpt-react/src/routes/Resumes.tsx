import React from "react";

import ResumeTemplateList from "../templates/ResumeTemplateList";
import ResumeList from "../tailoredDocuments/ResumeList";


const Resumes = (): React.JSX.Element => {
  return (
    <>
      <ResumeTemplateList />      
      <ResumeList />
    </>
  );
};

export default Resumes;