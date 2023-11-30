import { Job } from "../jobs/types";
import { ResumeTemplate } from "../templates/types";
import { ChatMessage } from "../common/types";


export type Substitution = {
  id: number,
  key: string,
  value: string,
  resume: number,
}

export type Resume = {
  id: number,
  substitutions: Substitution[],
  version: number,
  docx: string,
  png: string,
  chat_messages: ChatMessage[],
  job: Job,
  template: ResumeTemplate,
  name: string,
}

export type ResumeUpload = {
  job: number,
  template: number,
}

export function getPlaceholderResume(resumeUpload: ResumeUpload): Resume {
  return {
    id: -1,
    substitutions: [],
    version: -1,
    docx: "",
    png: "",
    chat_messages: [],
    job: {
      "id": resumeUpload.job,
      "url": "",
      "title": "",
      "company": "",
      "posting": "",
      "status": "",
    },
    template: {
      "id": resumeUpload.template,
      "name": "",
      "docx": "",
      "png": "",
      "fillFields": [],        
    },
    name: "",
  }
};