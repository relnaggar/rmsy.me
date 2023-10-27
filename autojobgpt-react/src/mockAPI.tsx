import { Job } from "./Jobs";
import { ResumeTemplateDownload } from "./Resumes";

export function generateResponse(data: any, status: number = 200): () => Promise<Response> {
  return async () => new Response(
    JSON.stringify(data), {
      status: status,
      headers: {
        "Content-type": "application/json",
      },
    }
  );
}

export const validJob1: Job = {
  id: 1,
  url: "https://www.example1.com",
  title: "Test Job 1",
  company: "Test Company 1",
  text: "Test Text 1",    
  chat_messages: [],
  date_applied: null,
  status: "",
  resume_template: null,
  chosen_resume: null,
}

export const validJob2: Job = {
  id: 2,
  url: "https://www.example2.com",
  title: "Test Job 2",
  company: "Test Company 2",
  text: "Test Text 2",    
  chat_messages: [],
  date_applied: null,
  status: "",
  resume_template: null,
  chosen_resume: null,
}

export const validResumeTemplate1: ResumeTemplateDownload = {
  name: "Test Resume Template 1",
  description: "Test Description 1",
  upload: "https://www.example.com/test1.docx",
  png: "https://www.example.com/test1.png",
}

export const validResumeTemplate2: ResumeTemplateDownload = {
  name: "Test Resume Template 2",
  description: "Test Description 2",
  upload: "https://www.example.com/test2.docx",
  png: "https://www.example.com/test2.png",
}