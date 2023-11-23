export interface WithID {
  id: number
}

export type ChatMessage = {
  role: string,
  content: string,
}

export interface Document {
  id: number,
  name: string,
  docx: string,
  png: string,
}