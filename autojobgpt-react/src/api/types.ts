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
  notes: string,
};

export interface JobUpload extends Pick<Job,
  "url" |
  "title" |
  "company" |
  "posting" |
  "notes"
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
  paragraphs: string[],
};

export interface TemplateUpload extends Pick<Omit<Template, "docx">, "name" | "additional_information" | "type"> {
  docx: File,
};

export interface Substitution extends WithId {
  key: string,
  value: string,
  tailored_document: number,
};

export interface TailoredDocument extends Document {
  substitutions: Substitution[],
  version: number,
  job: Job,
  template: Template,
  type: DocumentType,
};

export interface TailoredDocumentUpload extends Pick<TailoredDocument, "type"> {
  job: number,
  template: number,
};