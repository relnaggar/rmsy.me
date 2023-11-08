import React, { useState, useEffect } from "react";

import { Resume, ResumeUpload } from "../types";
import { FetchData } from "../../routes/types";


export default function usePostResume(
  fetchData: FetchData,
  resumes: Resume[],
  setResumes: React.Dispatch<React.SetStateAction<Resume[]>>,
): {
  addResume: (resume: ResumeUpload) => void,
  error: string,
} {
  const [addedResume, setAddedResume] = useState<ResumeUpload | null>(null);
  const [error, setError] = useState<string>("");

  // add template to server if addedTemplate is changed to a non-null value
  useEffect(() => {
    async function postResume(): Promise<void> {
      await fetchData("../api/resumes/", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          "job": addedResume?.job,
          "template": addedResume?.template,
        }),        
      })
      .then((response) => response.json())
      .then((data) => {
        // replace placeholder resume with resume from server
        setResumes([
          ...resumes.filter((resume) => resume.id !== -1),
          data
        ]);
        // resume has been added so set addedResume to null
        setAddedResume(null);
      })
      .catch((error) => setError(error.message));
    }
    if (addedResume !== null) {
      postResume();
    }
  }, [fetchData, addedResume]);

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

  return { addResume, error };
}