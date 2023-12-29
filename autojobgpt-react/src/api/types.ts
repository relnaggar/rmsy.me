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
  chosen_resume: number | null,
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

export type DocumentType = "resume" | "coverLetter";

export interface Template extends Document {
  fill_fields: FillField[],
  additional_information?: string,
  type: DocumentType,
};

export interface TemplateUpload extends Omit<Template,
  "id" |
  "docx" |
  "fill_fields" |
  "png"
> {
    docx: File,
};

export interface Substitution extends WithId {
  key: string,
  value: string,
  tailored_document: number,
};

export interface ChatMessage {
  role: string,
  content: string,
};

export interface TailoredDocument extends Document {
  substitutions: Substitution[],
  version: number,
  chat_messages: ChatMessage[],
  job: Job,
  template: Template,
  type: DocumentType,
  template_paragraphs: string[],
};

export interface TailoredDocumentUpload extends Pick<TailoredDocument, "type"> {
  job: number,
  template: number,
};