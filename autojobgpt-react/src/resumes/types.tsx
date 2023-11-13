import { Job } from "../jobs/types";
import { ChatMessage } from "../common/types";

type Substition = {
  id: number,
  key: string,
  value: string,
  resume: number,
}

export type Resume = {
  id: number,
  substitutions: Substition[],
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

export type ResumeTemplate = {
  id: number,
  name: string,
  docx: string,
  png: string,
  description?: string
}

export type ResumeTemplateUpload = {
  name: string,
  docx: File,
  description?: string
}

export type FillField = {
  id: number,
  key: string,
  description: string,
  template: number | null,
}