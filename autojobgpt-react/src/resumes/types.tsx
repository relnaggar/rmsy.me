import { Job } from "../jobs/types";
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
  job: Job | number,
  template: number,
  name: string,
}

export type ResumeUpload = {
  job: number,
  template: number,
}