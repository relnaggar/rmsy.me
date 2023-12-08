export interface WithID {
  id: number
};

export type ChatMessage = {
  role: string,
  content: string,
};

export interface Document {
  id: number,
  name: string,
  docx: string,
  png: string,
};

export interface ModalProps {
  show: boolean,
  setShow: React.Dispatch<React.SetStateAction<boolean>>,
  errors: Record<string,string[]>,
  setErrors: React.Dispatch<React.SetStateAction<Record<string,string[]>>>,
  showErrorAlert: boolean,
  setShowErrorAlert: React.Dispatch<React.SetStateAction<boolean>>,
};