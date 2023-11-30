export type ResumeTemplate = {
  id: number,
  name: string,
  docx: string,
  png: string,
  fillFields: FillField[],
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