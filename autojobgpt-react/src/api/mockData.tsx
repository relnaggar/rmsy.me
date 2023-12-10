import { generateErrorResponse } from "./mockApi";
import { Job, Resume, ResumeTemplate, Status } from "./types";


export const errorMessage = "Test Error Message";

export const testDataForApiGeneralErrors = (mockFunctions: {[key: string]: jest.MockedFunction<any>}): {
  apiErrorType: string,
  mockApiError: () => void,
}[] => [{
  apiErrorType: "network",
  mockApiError: () => mockFunctions.fetchData.mockRejectedValueOnce(new Error(errorMessage)),
}, {
  apiErrorType: "general",
  mockApiError: () => mockFunctions.fetchData.mockImplementationOnce(generateErrorResponse({error: [errorMessage]})),
}];


export const validStatus1: Status = {
  id: 1,
  name: "Test Status 1",
  order: 1,
};

export const validStatus2: Status = {
  id: 2,
  name: "Test Status 2",
  order: 2,
};


export const validJob1: Job = {
  id: 1,
  url: "https://www.example1.com",
  title: "Test Job 1",
  company: "Test Company 1",
  posting: "Test Text 1",
  status: 1,
}

export const validJob2: Job = {
  id: 2,
  url: "https://www.example2.com",
  title: "Test Job 2",
  company: "Test Company 2",
  posting: "Test Text 2",
  status: 1,
}


export const validResumeTemplate1: ResumeTemplate = {
  id: 1,
  name: "Test Resume Template 1",
  description: "Test Description 1",
  docx: "https://www.example.com/test1.docx",
  png: "https://www.example.com/test1.png",
  fillFields: [],
};

export const validResumeTemplate2: ResumeTemplate = {
  id: 2,
  name: "Test Resume Template 2",
  description: "Test Description 2",
  docx: "https://www.example.com/test2.docx",
  png: "https://www.example.com/test2.png",
  fillFields: [],
};


export const validResume1: Resume = {
  id: 1,
  substitutions: [],
  version: 1,
  docx: "https://www.example.com/test1.docx",
  png: "https://www.example.com/test1.png",
  chat_messages: [],
  job: validJob1,
  template: validResumeTemplate1,
  name: validJob1.title + ", " + validJob1.company + ", " + 1
};

export const validResume2: Resume = {
  id: 2,
  substitutions: [],
  version: 1,
  docx: "https://www.example.com/test2.docx",
  png: "https://www.example.com/test2.png",
  chat_messages: [],
  job: validJob2,
  template: validResumeTemplate2,
  name: validJob2.title + ", " + validJob2.company + ", " + 1
};