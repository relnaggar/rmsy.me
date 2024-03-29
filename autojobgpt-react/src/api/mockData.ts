import { generateErrorResponse } from "./mockApi";
import { Job, TailoredDocument, Template, Status } from "./types";
import { defaultFillFields } from "./constants";


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

export const validStatus3: Status = {
  id: 3,
  name: "Test Status 3",
  order: 3,
};


export const validJob1: Job = {
  id: 1,
  url: "https://www.example1.com",
  title: "Test Job 1",
  company: "Test Company 1",
  posting: "Test Text 1",
  status: 1,
  chosen_resume: 1,
  notes: "Test Notes 1",
}

export const validJob2: Job = {
  id: 2,
  url: "https://www.example2.com",
  title: "Test Job 2",
  company: "Test Company 2",
  posting: "Test Text 2",
  status: 2,
  chosen_resume: 2,
  notes: "Test Notes 2",
}

export const validJob3: Job = {
  id: 3,
  url: "https://www.example3.com",
  title: "Test Job 3",
  company: "Test Company 3",
  posting: "Test Text 3",
  status: 3,
  chosen_resume: null,
  notes: "Test Notes 3",
}

export const validResumeTemplate1: Template = {
  id: 1,
  name: "Test Resume Template 1",
  additional_information: "Test Additional Information 1",
  docx: "https://www.example.com/test1.docx",
  png: "https://www.example.com/test1.png",
  fill_fields: [{
    id: 1,
    key: "Test Fill Field Key 1",
    description: "Test Fill Field Description 1",
    template: 1,
  }, {
    id: 2,
    key: "Test Fill Field Key 2",
    description: "Test Fill Field Description 2",
    template: 1,
  }, {
    id: 3,
    key: "Test Fill Field Key 3",
    description: "Test Fill Field Description 3",
    template: 1,
  }],
  type: "resume",
  paragraphs: ["{{Test Fill Field Key 1}}", "{{Test Fill Field Key 2}}", "{{Test Fill Field Key 3}}"],
};

export const validResumeTemplate2: Template = {
  id: 2,
  name: "Test Resume Template 2",
  additional_information: "Test Additional Information 2",
  docx: "https://www.example.com/test2.docx",
  png: "https://www.example.com/test2.png",
  fill_fields: [{
    id: 4,
    key: defaultFillFields[0],
    description: "Test Fill Field Description 4",
    template: 2,
  }, {
    id: 5,
    key: defaultFillFields[1],
    description: "Test Fill Field Description 5",
    template: 2,
  }, {
    id: 6,
    key: "Test Fill Field Key 6",
    description: "Test Fill Field Description 6",
    template: 2,
  }],
  type: "resume",
  paragraphs: [`{{${defaultFillFields[0]}}}`, `{{${defaultFillFields[1]}}}`, "{{Test Fill Field Key 6}}"],
};

export const validResumeTemplate3: Template = {
  id: 3,
  name: "Test Resume Template 3",
  additional_information: "Test Additional Information 3",
  docx: "https://www.example.com/test3.docx",
  png: "https://www.example.com/test3.png",
  fill_fields: [],
  type: "resume",
  paragraphs: [],
};

export const validResume1: TailoredDocument = {
  id: 1,
  substitutions: [
    {
      id: 1,
      key: "Test Fill Field Key 1",
      value: "Test Value 1",
      tailored_document: 1,
    }, {
      id: 2,
      key: "Test Fill Field Key 2",
      value: "Test Value 2",
      tailored_document: 1,
    }, {
      id: 3,
      key: "Test Fill Field Key 3",
      value: "Test Value 3",
      tailored_document: 1,
    }
  ],
  version: 1,
  docx: "https://www.example.com/test1.docx",
  png: "https://www.example.com/test1.png",
  job: validJob1,
  template: validResumeTemplate1,
  name: validJob1.title + ", " + validJob1.company + ", " + 1,
  type: "resume",
};

export const validResume2: TailoredDocument = {
  id: 2,
  substitutions: [
    {
      id: 4,
      key: defaultFillFields[0],
      value: "Test Value 4",
      tailored_document: 2,
    }, {
      id: 5,
      key: defaultFillFields[1],
      value: "Test Value 5",
      tailored_document: 2,
    }, {
      id: 6,
      key: "Test Fill Field Key 6",
      value: "Test Value 6",
      tailored_document: 2,
    }
  ],
  version: 1,
  docx: "https://www.example.com/test2.docx",
  png: "https://www.example.com/test2.png",
  job: validJob2,
  template: validResumeTemplate2,
  name: validJob2.title + ", " + validJob2.company + ", " + 1,
  type: "resume",
};

export const validResume3: TailoredDocument = {
  id: 3,
  substitutions: [],
  version: 1,
  docx: "https://www.example.com/test3.docx",
  png: "https://www.example.com/test3.png",
  job: validJob3,
  template: validResumeTemplate3,
  name: validJob3.title + ", " + validJob3.company + ", " + 1,
  type: "resume",
};