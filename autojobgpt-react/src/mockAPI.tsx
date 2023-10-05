import { Job } from "./Jobs";

export function generateResponse(data: any, status: number = 200): () => Promise<Response> {
  return async () => new Response(
    JSON.stringify(data), {
      status: status,
      headers: {
        'Content-type': 'application/json',
      },
    }
  );
}

export const validJob1: Job = {
  id: 1,
  url: "https://www.example.com",
  title: "Test Job",
  company: "Test Company",
  text: "Test Text",    
  chat_messages: [],
  date_applied: null,
  status: "",
  resume_template: null,
  chosen_resume: null,
}

export const validJob2: Job = {
  id: 2,
  url: "https://www.example2.com",
  title: "Test Job 2",
  company: "Test Company 2",
  text: "Test Text 2",    
  chat_messages: [],
  date_applied: null,
  status: "",
  resume_template: null,
  chosen_resume: null,
}