import { ChatMessage } from '../common/types';

export type Job = {
  id: number,
  url: string,
  title: string,
  company: string,
  text: string,
  chat_messages: ChatMessage[],
  date_applied: string | null,
  status: string,
  resume_template: string | null,
  chosen_resume: string | null,
}

export type JobUpload = {
  url: string,
}