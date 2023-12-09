export interface WithId {
  id: number
};

export interface Status extends WithId {
  name: string,
  order: number,
};

export interface StatusUpload extends Pick<Status,
  "name"
> {};

export interface Job extends WithId {
  url: string,
  title: string,
  company: string,
  posting: string,
  status: number,
};

export interface JobUpload extends Pick<Job,
  "url" |
  "title" |
  "company" |
  "posting"
> {};

export interface JobDetails extends Pick<JobUpload,
  "title" |
  "company" |
  "posting"
> {};

export interface Document extends WithId {
  name: string,
  docx: string,
  png: string,
};

export interface FillField extends WithId {
  key: string,
  description: string,
  template: number,
};

export interface ResumeTemplate extends Document {
  fillFields: FillField[],
  description?: string
};

export interface ResumeTemplateUpload extends Omit<ResumeTemplate,
  "id" |
  "docx" |
  "fillFields" |
  "png"
> {
    docx: File,
};

export interface Substitution extends WithId {
  key: string,
  value: string,
  resume: number,
};

export interface ChatMessage {
  role: string,
  content: string,
};

export interface Resume extends Document {
  substitutions: Substitution[],
  version: number,
  chat_messages: ChatMessage[],
  job: Job,
  template: ResumeTemplate,
};

export interface ResumeUpload {
  job: number,
  template: number,
};